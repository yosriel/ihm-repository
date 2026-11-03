package com.falabella.ihm.catalog;

import java.math.BigDecimal;

import com.falabella.ihm.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductCatalog catalog;

    public ProductController(ProductCatalog catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public ProductCatalog.ProductPage products(
        @RequestParam(required = false) String q, @RequestParam(required = false) String brand,
        @RequestParam(required = false) BigDecimal minPrice, @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) BigDecimal minRating, @RequestParam(required = false) BigDecimal minDiscount,
        @RequestParam(required = false) String delivery, @RequestParam(required = false) String seller,
        @RequestParam(required = false) String capacity, @RequestParam(required = false) String color,
        @RequestParam(defaultValue = "recommended") String sort,
        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size) {
        return catalog.search(new ProductFilter(q, brand, minPrice, maxPrice, minRating, minDiscount,
            delivery, seller, capacity, color, sort, page, size));
    }

    @GetMapping("/{id}")
    public Product product(@PathVariable String id) {
        return catalog.find(id).orElseThrow(() -> new ApiException(
            HttpStatus.NOT_FOUND, "No encontramos ese producto.", "productId"));
    }
}
