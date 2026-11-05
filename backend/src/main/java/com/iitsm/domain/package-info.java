/**
 * Root domain package for the Intelligent IT Service Management (I-ITSM) system.
 *
 * <p>ARCHITECTURAL INVARIANT: This layer contains pure Java business logic, entity models,
 * value objects, domain events, and domain rules. It MUST remain completely isolated from
 * external frameworks: no Spring Framework annotations or imports, no Jakarta Persistence / JPA
 * annotations, and no dependencies on the {@code application}, {@code infrastructure}, or
 * {@code api} packages. This is enforced via ArchUnit architecture tests.
 */
package com.iitsm.domain;

