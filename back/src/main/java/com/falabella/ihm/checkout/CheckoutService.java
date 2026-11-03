package com.falabella.ihm.checkout;

import java.math.BigDecimal;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.falabella.ihm.api.ApiException;
import com.falabella.ihm.catalog.Product;
import com.falabella.ihm.catalog.ProductCatalog;
import com.falabella.ihm.checkout.SimulationStore.PricedItem;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CheckoutService {

    private static final BigDecimal HOME_DELIVERY = new BigDecimal("12.90");
    private static final BigDecimal FREE_DELIVERY = new BigDecimal("0.00");
    private static final Set<String> DISTRICTS = Set.of(
        "Miraflores", "San Isidro", "Santiago de Surco", "San Borja", "Barranco", "Jesús María");

    private final ProductCatalog catalog;
    private final SimulationStore simulations;

    public CheckoutService(ProductCatalog catalog, SimulationStore simulations) {
        this.catalog = catalog;
        this.simulations = simulations;
    }

    public Quote quote(List<ItemRequest> items, String deliveryMethod) {
        return calculate(items, deliveryMethod).quote();
    }

    private Calculation calculate(List<ItemRequest> items, String deliveryMethod) {
        if (!"home".equals(deliveryMethod) && !"pickup".equals(deliveryMethod)) {
            throw ApiException.invalid("Elige entrega a domicilio o retiro.", "deliveryMethod");
        }
        if (items == null || items.isEmpty()) {
            throw ApiException.invalid("Agrega al menos un producto al carro.", "items");
        }
        if (items.size() > 48) {
            throw ApiException.invalid("Revisa los productos del carro.", "items");
        }

        BigDecimal subtotal = new BigDecimal("0.00");
        int itemCount = 0;
        Set<String> productIds = new HashSet<>();
        List<PricedItem> pricedItems = new ArrayList<>();
        for (ItemRequest item : items) {
            if (item == null || item.productId() == null || item.productId().isBlank()) {
                throw ApiException.invalid("Cada producto necesita un identificador válido.", "items");
            }
            if (!productIds.add(item.productId())) {
                throw ApiException.invalid("El producto está repetido. Actualiza su cantidad.", "items");
            }
            Product product = catalog.find(item.productId()).orElseThrow(() ->
                ApiException.invalid("Uno de los productos ya no está disponible.", "items"));
            int quantity = validQuantity(item.quantity(), product);
            if ("pickup".equals(deliveryMethod) && "home".equals(product.delivery())) {
                throw ApiException.invalid("Un producto de tu carro solo tiene entrega a domicilio.", "deliveryMethod");
            }
            subtotal = subtotal.add(product.price().multiply(BigDecimal.valueOf(quantity)));
            itemCount += quantity;
            pricedItems.add(new PricedItem(product.id(), quantity, product.price()));
        }
        BigDecimal delivery = "home".equals(deliveryMethod) ? HOME_DELIVERY : FREE_DELIVERY;
        return new Calculation(new Quote(subtotal, delivery, subtotal.add(delivery), "PEN", itemCount), List.copyOf(pricedItems));
    }

    public Simulation simulate(SimulationRequest request, String idempotencyKey) {
        String key = validKey(idempotencyKey);
        if (!Boolean.TRUE.equals(request.acceptedTerms())) {
            throw ApiException.invalid("Acepta las condiciones de la simulación para continuar.", "acceptedTerms");
        }
        if ("home".equals(request.deliveryMethod())) {
            validateAddress(request.address());
        }
        String hash = requestHash(request);
        var previous = simulations.find(key);
        if (previous.isPresent()) return replay(previous.get(), hash);
        Calculation calculation = calculate(request.items(), request.deliveryMethod());
        try {
            return simulations.create(key, hash, calculation.quote(), request.deliveryMethod(), calculation.items());
        } catch (DuplicateKeyException exception) {
            // A concurrent request can win the unique key. Its transaction has committed
            // before this insert fails; read it outside the rolled-back transaction.
            return replay(simulations.find(key).orElseThrow(() -> exception), hash);
        }
    }

    public CheckoutOptions options() {
        return new CheckoutOptions("PEN", HOME_DELIVERY, FREE_DELIVERY, 2,
            DISTRICTS.stream().sorted().toList(),
            new PickupPoint("demo-miraflores", "Punto de retiro de demostración", "Miraflores, Lima · ubicación académica sin atención real"));
    }

    private static Simulation replay(SimulationStore.StoredSimulation stored, String hash) {
        if (!stored.hash().equals(hash)) throw new ApiException(HttpStatus.CONFLICT,
            "Esta clave ya se usó con otros datos. Inicia una nueva simulación.", "idempotencyKey");
        return stored.simulation();
    }

    private static String validKey(String value) {
        try {
            if (value != null && value.length() == 36 && UUID.fromString(value).toString().equalsIgnoreCase(value))
                return UUID.fromString(value).toString();
        } catch (IllegalArgumentException ignored) { }
        throw ApiException.invalid("Envía un UUID válido en Idempotency-Key.", "idempotencyKey");
    }

    private static String requestHash(SimulationRequest request) {
        if (request.items() == null || request.items().isEmpty() || request.items().size() > 48)
            throw ApiException.invalid("Agrega productos válidos al carro.", "items");
        if (request.items().stream().anyMatch(item -> item == null || item.productId() == null || item.productId().isBlank()))
            throw ApiException.invalid("Cada producto necesita un identificador válido.", "items");
        try {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            try (DataOutputStream output = new DataOutputStream(bytes)) {
                output.writeUTF(request.deliveryMethod() == null ? "" : request.deliveryMethod());
                output.writeInt(request.items().size());
                for (ItemRequest item : request.items().stream().sorted(Comparator.comparing(ItemRequest::productId)).toList()) {
                    if (item.productId().length() > 64) throw ApiException.invalid("Identificador de producto inválido.", "items");
                    output.writeUTF(item.productId());
                    output.writeUTF(item.quantity() == null ? "null" : item.quantity().stripTrailingZeros().toString());
                }
                if ("home".equals(request.deliveryMethod())) {
                    Address address = request.address();
                    output.writeUTF(address.district().strip());
                    output.writeUTF(address.street().strip());
                    output.writeBoolean(Boolean.TRUE.equals(address.noNumber()));
                    output.writeUTF(Boolean.TRUE.equals(address.noNumber()) ? "" : address.number().strip());
                    output.writeUTF(address.reference() == null ? "" : address.reference().strip());
                }
            }
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes.toByteArray()));
        } catch (IOException | NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No se pudo preparar la simulación.", exception);
        }
    }

    private static int validQuantity(BigDecimal quantity, Product product) {
        int units;
        try {
            units = quantity == null ? 0 : quantity.intValueExact();
        } catch (ArithmeticException exception) {
            throw ApiException.invalid("La cantidad debe ser un número entero entre 1 y 2.", "quantity");
        }
        if (units < 1 || units > product.maxQuantity() || units > product.stock()) {
            throw ApiException.invalid("Puedes elegir entre 1 y 2 unidades por producto.", "quantity");
        }
        return units;
    }

    private static void validateAddress(Address address) {
        if (address == null) {
            throw ApiException.invalid("Completa la dirección de entrega.", "address");
        }
        if (address.district() == null || !DISTRICTS.contains(address.district().strip())) {
            throw ApiException.invalid("Selecciona un distrito disponible.", "address.district");
        }
        if (address.street() == null || address.street().length() > 160
            || address.street().codePoints().filter(Character::isLetter).count() < 5) {
            throw ApiException.invalid("Escribe una avenida, calle o jirón con al menos cinco letras.", "address.street");
        }
        if (!Boolean.TRUE.equals(address.noNumber())) {
            String number = address.number() == null ? "" : address.number().strip();
            if (!number.matches("[0-9]{1,6}") || Integer.parseInt(number) < 1) {
                throw ApiException.invalid("Escribe un número entre 1 y 999999 o marca Dirección sin número.", "address.number");
            }
        }
        if (address.reference() != null && address.reference().length() > 200) {
            throw ApiException.invalid("Usa una referencia de hasta 200 caracteres.", "address.reference");
        }
    }

    public record ItemRequest(String productId, BigDecimal quantity) {
    }

    public record QuoteRequest(List<ItemRequest> items, String deliveryMethod) {
    }

    public record Address(String district, String street, String number, Boolean noNumber, String reference) {
    }

    public record SimulationRequest(List<ItemRequest> items, String deliveryMethod, Address address,
                                    Boolean acceptedTerms) {
    }

    public record Quote(BigDecimal subtotal, BigDecimal delivery, BigDecimal total, String currency, int itemCount) {
    }

    public record Simulation(String simulationId, BigDecimal subtotal, BigDecimal delivery, BigDecimal total,
                             String currency, int itemCount, String deliveryMethod, boolean simulated) {
    }

    private record Calculation(Quote quote, List<PricedItem> items) {}
    public record PickupPoint(String id, String name, String address) {}
    public record CheckoutOptions(String currency, BigDecimal homeDelivery, BigDecimal pickupDelivery,
                                  int maxQuantityPerProduct, List<String> districts, PickupPoint pickupPoint) {}
}
