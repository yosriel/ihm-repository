package com.falabella.ihm.checkout;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.falabella.ihm.checkout.CheckoutService.Quote;
import com.falabella.ihm.checkout.CheckoutService.Simulation;

@Repository
public class SimulationStore {
    private final JdbcClient jdbc;
    public SimulationStore(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Optional<StoredSimulation> find(String key) {
        return jdbc.sql("SELECT * FROM checkout_simulations WHERE idempotency_key = :key").param("key", key)
            .query((row, index) -> new StoredSimulation(row.getString("request_hash"),
                new Simulation(row.getString("simulation_id"), row.getBigDecimal("subtotal"), row.getBigDecimal("delivery"),
                    row.getBigDecimal("total"), row.getString("currency"), row.getInt("item_count"), row.getString("delivery_method"), true)))
            .optional();
    }

    @Transactional
    public Simulation create(String key, String hash, Quote quote, String method, List<PricedItem> items) {
        String simulationId = "SIM-" + UUID.randomUUID();
        jdbc.sql("""
            INSERT INTO checkout_simulations
            (simulation_id, idempotency_key, request_hash, subtotal, delivery, total, currency, item_count, delivery_method)
            VALUES (:id, :key, :hash, :subtotal, :delivery, :total, :currency, :count, :method)
            """).param("id", simulationId).param("key", key).param("hash", hash)
            .param("subtotal", quote.subtotal()).param("delivery", quote.delivery()).param("total", quote.total())
            .param("currency", quote.currency()).param("count", quote.itemCount()).param("method", method).update();
        for (PricedItem item : items) {
            jdbc.sql("""
                INSERT INTO simulation_items (simulation_id, product_id, quantity, unit_price)
                VALUES (:id, :productId, :quantity, :unitPrice)
                """).param("id", simulationId).param("productId", item.productId())
                .param("quantity", item.quantity()).param("unitPrice", item.unitPrice()).update();
        }
        return new Simulation(simulationId, quote.subtotal(), quote.delivery(), quote.total(), quote.currency(), quote.itemCount(), method, true);
    }

    public record PricedItem(String productId, int quantity, BigDecimal unitPrice) {}
    public record StoredSimulation(String hash, Simulation simulation) {}
}
