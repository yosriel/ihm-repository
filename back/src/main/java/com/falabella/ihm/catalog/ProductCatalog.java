package com.falabella.ihm.catalog;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ProductCatalog {
    private final JdbcClient jdbc;

    public ProductCatalog(JdbcClient jdbc) { this.jdbc = jdbc; }

    @Transactional(readOnly = true)
    public ProductPage search(ProductFilter filter) {
        List<String> conditions = new ArrayList<>();
        Map<String, Object> parameters = new HashMap<>();
        if (filter.q() != null) {
            conditions.add("(LOWER(name) LIKE :q ESCAPE '!' OR LOWER(brand) LIKE :q ESCAPE '!' OR LOWER(description) LIKE :q ESCAPE '!')");
            parameters.put("q", "%" + filter.q().toLowerCase(Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
        }
        equalFilter(conditions, parameters, "brand", filter.brand());
        equalFilter(conditions, parameters, "capacity", filter.capacity());
        equalFilter(conditions, parameters, "color", filter.color());
        equalFilter(conditions, parameters, "seller_type", filter.seller());
        if (filter.minPrice() != null) { conditions.add("price >= :minPrice"); parameters.put("minPrice", filter.minPrice()); }
        if (filter.maxPrice() != null) { conditions.add("price <= :maxPrice"); parameters.put("maxPrice", filter.maxPrice()); }
        if (filter.minRating() != null) { conditions.add("rating >= :minRating"); parameters.put("minRating", filter.minRating()); }
        if (filter.minDiscount() != null) {
            conditions.add("(CASE WHEN previous_price > 0 THEN (1 - price / previous_price) * 100 ELSE 0 END) >= :minDiscount");
            parameters.put("minDiscount", filter.minDiscount());
        }
        if ("pickup".equals(filter.delivery())) conditions.add("delivery = 'both'");
        String where = conditions.isEmpty() ? "" : " WHERE " + String.join(" AND ", conditions);
        long total = jdbc.sql("SELECT COUNT(*) FROM products" + where).params(parameters).query(Long.class).single();
        String order = switch (filter.sort()) {
            case "price-asc" -> "price ASC, id ASC";
            case "price-desc" -> "price DESC, id ASC";
            case "rating-desc" -> "rating DESC, id ASC";
            default -> "rating DESC, review_count DESC, id ASC";
        };
        parameters.put("limit", filter.size());
        parameters.put("offset", (long) filter.page() * filter.size());
        List<Product> products = jdbc.sql("SELECT * FROM products" + where + " ORDER BY " + order + " LIMIT :limit OFFSET :offset")
            .params(parameters).query(this::mapProduct).list();
        return new ProductPage(withFeatures(products), filter.page(), filter.size(), total,
            (int) ((total + filter.size() - 1) / filter.size()));
    }

    @Transactional(readOnly = true)
    public Optional<Product> find(String id) {
        List<Product> products = jdbc.sql("SELECT * FROM products WHERE id = :id").param("id", id).query(this::mapProduct).list();
        return withFeatures(products).stream().findFirst();
    }

    public long count() { return jdbc.sql("SELECT COUNT(*) FROM products").query(Long.class).single(); }

    public FilterOptions filters() {
        return new FilterOptions(values("brand"), values("capacity"), values("color"),
            List.of(new Option("falabella", "Falabella"), new Option("marketplace", "Tiendas del marketplace")),
            List.of(new Option("home", "Entrega a domicilio"), new Option("pickup", "Retiro en tienda")),
            List.of(new Option("recommended", "Recomendados"), new Option("price-asc", "Menor precio"),
                new Option("price-desc", "Mayor precio"), new Option("rating-desc", "Mejor calificación")));
    }

    private List<String> values(String column) {
        // column is exclusively one of the internal literals above, never request input.
        return jdbc.sql("SELECT DISTINCT " + column + " FROM products ORDER BY " + column).query(String.class).list();
    }

    private static void equalFilter(List<String> conditions, Map<String, Object> parameters, String column, String value) {
        if (value != null) { conditions.add("LOWER(" + column + ") = :" + column); parameters.put(column, value.toLowerCase(Locale.ROOT)); }
    }

    private List<Product> withFeatures(List<Product> products) {
        if (products.isEmpty()) return products;
        Map<String, List<String>> features = new HashMap<>();
        jdbc.sql("SELECT product_id, feature FROM product_features WHERE product_id IN (:ids) ORDER BY product_id, feature_order")
            .param("ids", products.stream().map(Product::id).toList())
            .query((row, index) -> {
                features.computeIfAbsent(row.getString("product_id"), ignored -> new ArrayList<>()).add(row.getString("feature"));
                return 0;
            }).list();
        return products.stream().map(product -> new Product(product.id(), product.slug(), product.brand(), product.name(),
            product.description(), product.price(), product.previousPrice(), product.rating(), product.reviewCount(),
            product.capacity(), product.color(), product.image(), product.seller(), product.sellerType(), product.delivery(),
            product.stock(), product.maxQuantity(), List.copyOf(features.getOrDefault(product.id(), List.of())))).toList();
    }

    private Product mapProduct(ResultSet row, int index) throws SQLException {
        return new Product(row.getString("id"), row.getString("slug"), row.getString("brand"), row.getString("name"),
            row.getString("description"), row.getBigDecimal("price"), row.getBigDecimal("previous_price"), row.getDouble("rating"),
            row.getInt("review_count"), row.getString("capacity"), row.getString("color"), row.getString("image"),
            row.getString("seller"), row.getString("seller_type"), row.getString("delivery"), row.getInt("stock"), row.getInt("max_quantity"), List.of());
    }

    public record ProductPage(List<Product> items, int page, int size, long totalElements, int totalPages) {}
    public record Option(String value, String label) {}
    public record FilterOptions(List<String> brands, List<String> capacities, List<String> colors, List<Option> sellers,
                                List<Option> deliveryMethods, List<Option> sortOptions) {}
}
