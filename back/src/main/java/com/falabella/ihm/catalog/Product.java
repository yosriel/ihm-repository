package com.falabella.ihm.catalog;

import java.math.BigDecimal;
import java.util.List;

public record Product(
    String id,
    String slug,
    String brand,
    String name,
    String description,
    BigDecimal price,
    BigDecimal previousPrice,
    double rating,
    int reviewCount,
    String capacity,
    String color,
    String image,
    String seller,
    String sellerType,
    String delivery,
    int stock,
    int maxQuantity,
    List<String> features
) {
}
