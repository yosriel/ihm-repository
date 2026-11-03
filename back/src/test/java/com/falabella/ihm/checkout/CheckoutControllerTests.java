package com.falabella.ihm.checkout;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CheckoutControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbc;

    @Test
    void quotesOneUnitWithDeliveryUsingCatalogPrice() throws Exception {
        quote("""
            {"items":[{"productId":"taurus-air-fry","quantity":1,"price":1}],
             "deliveryMethod":"home","subtotal":1,"delivery":0,"total":1}
            """)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.subtotal").value(389.00))
            .andExpect(jsonPath("$.delivery").value(12.90))
            .andExpect(jsonPath("$.total").value(401.90))
            .andExpect(jsonPath("$.currency").value("PEN"))
            .andExpect(jsonPath("$.itemCount").value(1));
    }

    @Test
    void quotesTwoUnitsAndChargesDeliveryOnce() throws Exception {
        quote(cart("taurus-air-fry", "2", "home"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.subtotal").value(778.00))
            .andExpect(jsonPath("$.delivery").value(12.90))
            .andExpect(jsonPath("$.total").value(790.90))
            .andExpect(jsonPath("$.itemCount").value(2));
    }

    @Test
    void quotesPickupWithoutDeliveryCharge() throws Exception {
        quote(cart("taurus-air-fry", "2", "pickup"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.delivery").value(0))
            .andExpect(jsonPath("$.total").value(778));
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1", "3", "1.5", "null", "999999999999999999999999"})
    void rejectsInvalidQuantities(String quantity) throws Exception {
        quote(cart("taurus-air-fry", quantity, "home"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("quantity"));
    }

    @Test
    void rejectsRepeatedProducts() throws Exception {
        quote("""
            {"items":[{"productId":"taurus-air-fry","quantity":2},
                      {"productId":"taurus-air-fry","quantity":2}],"deliveryMethod":"home"}
            """)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("items"));
    }

    @Test
    void rejectsEmptyCart() throws Exception {
        quote("{\"items\":[],\"deliveryMethod\":\"home\"}")
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("items"));
    }

    @Test
    void rejectsUnknownProduct() throws Exception {
        quote(cart("unknown", "1", "home"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("items"));
    }

    @Test
    void rejectsPickupForHomeOnlyProduct() throws Exception {
        quote(cart("imaco-compact", "1", "pickup"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("deliveryMethod"));
    }

    @Test
    void rejectsUnknownDeliveryMethod() throws Exception {
        quote(cart("taurus-air-fry", "1", "express"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("deliveryMethod"));
    }

    @Test
    void requiresAcceptedTerms() throws Exception {
        simulate("""
            {"items":[{"productId":"taurus-air-fry","quantity":1}],
             "deliveryMethod":"pickup","acceptedTerms":false}
            """)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("acceptedTerms"));
    }

    @Test
    void completesPickupSimulationWithoutAddress() throws Exception {
        simulate("""
            {"items":[{"productId":"taurus-air-fry","quantity":1}],
             "deliveryMethod":"pickup","acceptedTerms":true}
            """)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.simulationId").isString())
            .andExpect(jsonPath("$.simulated").value(true))
            .andExpect(jsonPath("$.total").value(389))
            .andExpect(jsonPath("$.deliveryMethod").value("pickup"))
            .andExpect(jsonPath("$.address").doesNotExist());
    }

    @Test
    void completesHomeSimulationWithValidAddress() throws Exception {
        simulate(simulation("Miraflores", "Avenida Arequipa", "123", false))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.simulated").value(true))
            .andExpect(jsonPath("$.total").value(401.90));
    }

    @Test
    void permitsAddressWithoutStreetNumber() throws Exception {
        simulate(simulation("Jesús María", "Avenida Brasil", "", true))
            .andExpect(status().isOk());
    }

    @Test
    void requiresHomeAddress() throws Exception {
        simulate("""
            {"items":[{"productId":"taurus-air-fry","quantity":1}],
             "deliveryMethod":"home","acceptedTerms":true}
            """)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("address"));
    }

    @Test
    void rejectsUnsupportedDistrict() throws Exception {
        simulate(simulation("Desconocido", "Avenida Arequipa", "123", false))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("address.district"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"123456", "Abc", "123 ab"})
    void requiresAtLeastFiveLettersInStreet(String street) throws Exception {
        simulate(simulation("Miraflores", street, "123", false))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("address.street"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "0", "-1", "1234567", "ABC"})
    void validatesStreetNumber(String number) throws Exception {
        simulate(simulation("Miraflores", "Avenida Arequipa", number, false))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.field").value("address.number"));
    }

    @Test
    void returnsJsonErrorForMalformedBody() throws Exception {
        quote("{")
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").isString());
    }

    private ResultActions quote(String body) throws Exception {
        return mockMvc.perform(post("/api/checkout/quote").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions simulate(String body) throws Exception {
        return mockMvc.perform(post("/api/checkout/simulate").header("Idempotency-Key", UUID.randomUUID().toString()).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void persistsSimulationAndReplaysSameKeyWithoutDuplicates() throws Exception {
        String key = UUID.randomUUID().toString();
        String body = simulation("Miraflores", "Avenida Arequipa", "123", false);
        String first = mockMvc.perform(post("/api/checkout/simulate").header("Idempotency-Key", key)
            .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        mockMvc.perform(post("/api/checkout/simulate").header("Idempotency-Key", key)
            .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk())
            .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().json(first));
        org.junit.jupiter.api.Assertions.assertEquals(1L, jdbc.sql("SELECT COUNT(*) FROM checkout_simulations WHERE idempotency_key = :key")
            .param("key", key).query(Long.class).single());
        org.junit.jupiter.api.Assertions.assertEquals(1L, jdbc.sql("SELECT COUNT(*) FROM simulation_items WHERE simulation_id IN (SELECT simulation_id FROM checkout_simulations WHERE idempotency_key = :key)")
            .param("key", key).query(Long.class).single());
        mockMvc.perform(post("/api/checkout/simulate").header("Idempotency-Key", key)
            .contentType(MediaType.APPLICATION_JSON).content(simulation("Miraflores", "Avenida Arequipa", "456", false)))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.field").value("idempotencyKey"));
    }

    @Test
    void requiresIdempotencyKey() throws Exception {
        mockMvc.perform(post("/api/checkout/simulate").contentType(MediaType.APPLICATION_JSON)
            .content(simulation("Miraflores", "Avenida Arequipa", "123", false)))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.field").value("idempotencyKey"));
    }

    @Test
    void providesDeliveryOptionsAndExplicitCors() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/checkout/options"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.districts.length()").value(6))
            .andExpect(jsonPath("$.homeDelivery").value(12.9));
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/checkout/simulate")
            .header("Origin", "http://localhost:5173").header("Access-Control-Request-Method", "POST")
            .header("Access-Control-Request-Headers", "Content-Type,Idempotency-Key"))
            .andExpect(status().isOk()).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                .string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/checkout/simulate")
            .header("Origin", "https://unconfigured.example").header("Access-Control-Request-Method", "POST"))
            .andExpect(status().isForbidden());
    }

    private static String cart(String productId, String quantity, String method) {
        return """
            {"items":[{"productId":"%s","quantity":%s}],"deliveryMethod":"%s"}
            """.formatted(productId, quantity, method);
    }

    private static String simulation(String district, String street, String number, boolean noNumber) {
        return """
            {"items":[{"productId":"taurus-air-fry","quantity":1}],"deliveryMethod":"home",
             "acceptedTerms":true,"address":{"district":"%s","street":"%s","number":"%s",
             "noNumber":%s,"reference":"Frente al parque"}}
            """.formatted(district, street, number, noNumber);
    }
}
