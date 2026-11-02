package com.falabella.ihm.checkout;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("mysql-it")
class MySqlPersistenceIT {
    @DynamicPropertySource
    static void requireDedicatedTestDatabase(DynamicPropertyRegistry registry) {
        String url = System.getenv("IT_DB_URL");
        if (url == null || !url.matches("jdbc:mysql://[^/]+/[A-Za-z0-9_]+_test(?:\\?.*)?")) {
            throw new IllegalArgumentException("IT_DB_URL debe señalar una base MySQL dedicada cuyo nombre termine en _test.");
        }
        registry.add("spring.datasource.url", () -> url);
    }
    @Autowired DataSource dataSource;
    @Autowired JdbcClient jdbc;
    @Autowired CheckoutService checkout;
    @Autowired SimulationStore store;

    @Test
    void appliesMigrationsToRealMySqlAndKeepsTheCatalog() throws Exception {
        try (var connection = dataSource.getConnection()) {
            assertEquals("MySQL", connection.getMetaData().getDatabaseProductName());
        }
        assertEquals(6L, jdbc.sql("SELECT COUNT(*) FROM products").query(Long.class).single());
        assertEquals(24L, jdbc.sql("SELECT COUNT(*) FROM product_features").query(Long.class).single());
        assertEquals(2L, jdbc.sql("SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE AND version IS NOT NULL").query(Long.class).single());
    }

    @Test
    void concurrentRetriesCreateOneAtomicSimulation() throws Exception {
        String key = UUID.randomUUID().toString();
        var request = new CheckoutService.SimulationRequest(List.of(new CheckoutService.ItemRequest("taurus-air-fry", new BigDecimal("2"))), "pickup", null, true);
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> { start.await(); return checkout.simulate(request, key); });
            var second = executor.submit(() -> { start.await(); return checkout.simulate(request, key); });
            start.countDown();
            var result = first.get(20, TimeUnit.SECONDS);
            assertEquals(result.simulationId(), second.get(20, TimeUnit.SECONDS).simulationId());
            assertEquals(new BigDecimal("778.00"), result.total());
            assertEquals(1L, jdbc.sql("SELECT COUNT(*) FROM checkout_simulations WHERE idempotency_key = :key").param("key", key).query(Long.class).single());
            assertEquals(1L, jdbc.sql("SELECT COUNT(*) FROM simulation_items WHERE simulation_id = :id").param("id", result.simulationId()).query(Long.class).single());
            assertEquals(12, jdbc.sql("SELECT stock FROM products WHERE id = 'taurus-air-fry'").query(Integer.class).single());
        }
    }

    @Test
    void replaysRecordedTotalEvenIfCatalogPriceChanges() {
        String key = UUID.randomUUID().toString();
        var request = new CheckoutService.SimulationRequest(List.of(new CheckoutService.ItemRequest("oster-digital", BigDecimal.ONE)), "pickup", null, true);
        var first = checkout.simulate(request, key);
        try {
            jdbc.sql("UPDATE products SET price = 450.00 WHERE id = 'oster-digital'").update();
            assertEquals(first, checkout.simulate(request, key));
            assertEquals(first, store.find(key).orElseThrow().simulation());
        } finally {
            jdbc.sql("UPDATE products SET price = 449.00 WHERE id = 'oster-digital'").update();
        }
    }
}
