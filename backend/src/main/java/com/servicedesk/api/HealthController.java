package com.servicedesk.api;

import com.servicedesk.api.dto.HealthResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

  private final Clock clock;

  public HealthController(Clock clock) {
    this.clock = clock;
  }

  @GetMapping
  public ResponseEntity<HealthResponse> checkHealth() {
    String utcIsoTime = DateTimeFormatter.ISO_INSTANT.format(Instant.now(clock));
    return ResponseEntity.ok(new HealthResponse("UP", "servicedesk-backend", utcIsoTime));
  }
}
