package com.servicedesk.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Architectural tests enforcing domain isolation.
 *
 * <p>Guarantees that the backend domain layer remains 100% framework-free: - No Spring Framework
 * dependencies - No Jakarta / JPA persistence dependencies - No dependencies on application,
 * infrastructure, or api packages
 */
@AnalyzeClasses(
    packages = "com.servicedesk",
    importOptions = {ImportOption.DoNotIncludeTests.class})
public class DomainIsolationTest {

  @ArchTest
  static final ArchRule domainMustNotDependOnSpring =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("org.springframework..")
          .allowEmptyShould(true)
          .as("Domain layer must not depend on Spring Framework");

  @ArchTest
  static final ArchRule domainMustNotDependOnJpa =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("jakarta.persistence..")
          .allowEmptyShould(true)
          .as("Domain layer must not depend on Jakarta Persistence / JPA");

  @ArchTest
  static final ArchRule domainMustNotDependOnInfrastructureOrApi =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage("..infrastructure..", "..api..")
          .allowEmptyShould(true)
          .as("Domain layer must not depend on infrastructure or api packages");
}
