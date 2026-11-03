package com.falabella.ihm.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CatalogController {
    private final ProductCatalog catalog;
    public CatalogController(ProductCatalog catalog) { this.catalog = catalog; }

    @GetMapping("/api/catalog/filters")
    public ProductCatalog.FilterOptions filters() { return catalog.filters(); }
}
