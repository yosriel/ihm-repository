package com.falabella.ihm.checkout;

import com.falabella.ihm.checkout.CheckoutService.Quote;
import com.falabella.ihm.checkout.CheckoutService.QuoteRequest;
import com.falabella.ihm.checkout.CheckoutService.Simulation;
import com.falabella.ihm.checkout.CheckoutService.SimulationRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkout;

    public CheckoutController(CheckoutService checkout) {
        this.checkout = checkout;
    }

    @PostMapping("/quote")
    public Quote quote(@RequestBody QuoteRequest request) {
        return checkout.quote(request.items(), request.deliveryMethod());
    }

    @PostMapping("/simulate")
    public Simulation simulate(@RequestBody SimulationRequest request,
                               @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        return checkout.simulate(request, idempotencyKey);
    }

    @GetMapping("/options")
    public CheckoutService.CheckoutOptions options() { return checkout.options(); }
}
