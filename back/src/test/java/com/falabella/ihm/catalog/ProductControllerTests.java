package com.falabella.ihm.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void exposesSixDemoProductsWithTheirDeliveryOptions() throws Exception {
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements").value(6))
            .andExpect(jsonPath("$.items.length()").value(6))
            .andExpect(jsonPath("$.items[0].id").value("philips-essential"))
            .andExpect(jsonPath("$.items[0].price").value(599))
            .andExpect(jsonPath("$.items[0].maxQuantity").value(2))
            .andExpect(jsonPath("$.items[0].features.length()").value(4));
    }

    @Test
    void findsProductByItsSlug() throws Exception {
        mockMvc.perform(get("/api/products/taurus-air-fry"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug").value("taurus-air-fry"))
            .andExpect(jsonPath("$.capacity").value("4 L"));
    }

    @Test
    void returns404ForUnknownProduct() throws Exception {
        mockMvc.perform(get("/api/products/unknown"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void combinesBudgetBrandAndPickupFilters() throws Exception {
        mockMvc.perform(get("/api/products").param("brand", "taurus").param("maxPrice", "400").param("delivery", "pickup"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.items[0].id").value("taurus-air-fry"));
    }

    @Test
    void searchesSortsAndPaginates() throws Exception {
        mockMvc.perform(get("/api/products").param("q", "freidora").param("sort", "price-asc").param("size", "2").param("page", "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(6))
            .andExpect(jsonPath("$.totalPages").value(3)).andExpect(jsonPath("$.page").value(1))
            .andExpect(jsonPath("$.items[0].id").value("taurus-air-fry"))
            .andExpect(jsonPath("$.items[1].id").value("oster-digital"));
    }

    @Test
    void filtersRatingDiscountSellerCapacityAndColor() throws Exception {
        mockMvc.perform(get("/api/products").param("minRating", "4.6").param("minDiscount", "20")
            .param("seller", "falabella").param("capacity", "4 L").param("color", "negro"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].id").value("taurus-air-fry"));
    }

    @Test
    void returnsUsefulEmptyResultAndMetadata() throws Exception {
        mockMvc.perform(get("/api/products").param("q", "inexistente"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.items").isEmpty()).andExpect(jsonPath("$.totalPages").value(0));
        mockMvc.perform(get("/api/catalog/filters"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.brands.length()").value(4))
            .andExpect(jsonPath("$.sellers.length()").value(2));
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.CsvSource({"page,-1", "size,0", "size,49", "minPrice,-1", "minRating,6", "minDiscount,101", "delivery,express", "seller,unknown", "sort,price;DROP", "maxPrice,abc"})
    void rejectsInvalidFiltersAsJson(String parameter, String value) throws Exception {
        mockMvc.perform(get("/api/products").param(parameter, value))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.field").value(parameter));
    }

    @Test
    void treatsSqlAndWildcardCharactersAsSearchText() throws Exception {
        mockMvc.perform(get("/api/products").param("q", "%' OR 1=1 --"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void rejectsReversedPriceRange() throws Exception {
        mockMvc.perform(get("/api/products").param("minPrice", "500").param("maxPrice", "300"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.field").value("minPrice"));
    }
}
