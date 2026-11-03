package com.falabella.ihm.catalog;

import java.math.BigDecimal;
import java.util.Set;

import com.falabella.ihm.api.ApiException;

public record ProductFilter(String q, String brand, BigDecimal minPrice, BigDecimal maxPrice,
                            BigDecimal minRating, BigDecimal minDiscount, String delivery,
                            String seller, String capacity, String color, String sort, int page, int size) {
    public ProductFilter {
        q = clean(q, 120, "q");
        brand = clean(brand, 80, "brand");
        capacity = clean(capacity, 16, "capacity");
        color = clean(color, 24, "color");
        delivery = clean(delivery, 12, "delivery");
        seller = clean(seller, 24, "seller");
        if (page < 0 || page > 10000) throw ApiException.invalid("La página debe estar entre 0 y 10000.", "page");
        if (size < 1 || size > 48) throw ApiException.invalid("Elige entre 1 y 48 resultados por página.", "size");
        nonnegative(minPrice, new BigDecimal("99999999.99"), "minPrice");
        nonnegative(maxPrice, new BigDecimal("99999999.99"), "maxPrice");
        nonnegative(minRating, new BigDecimal("5"), "minRating");
        nonnegative(minDiscount, new BigDecimal("100"), "minDiscount");
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0)
            throw ApiException.invalid("El precio mínimo no puede superar al máximo.", "minPrice");
        if (delivery != null && !Set.of("home", "pickup").contains(delivery))
            throw ApiException.invalid("Elige home o pickup.", "delivery");
        if (seller != null && !Set.of("falabella", "marketplace").contains(seller))
            throw ApiException.invalid("Elige falabella o marketplace.", "seller");
        if (!Set.of("recommended", "price-asc", "price-desc", "rating-desc").contains(sort))
            throw ApiException.invalid("Selecciona un orden disponible.", "sort");
    }

    private static String clean(String value, int maxLength, String field) {
        if (value == null || value.isBlank()) return null;
        if (value.length() > maxLength) throw ApiException.invalid("El valor es demasiado largo.", field);
        return value.strip();
    }

    private static void nonnegative(BigDecimal value, BigDecimal maximum, String field) {
        if (value != null && (value.signum() < 0 || value.compareTo(maximum) > 0))
            throw ApiException.invalid("El valor está fuera del rango permitido.", field);
    }
}
