package com.servicedesk.infrastructure.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration defining the application-wide {@link Clock} bean. Using a bean allows deterministic
 * time control in tests via fixed clocks.
 */
@Configuration
public class ClockConfig {

  @Bean
  public Clock clock() {
    return Clock.systemUTC();
  }
}
