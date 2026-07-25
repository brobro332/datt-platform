package org.springframework.data.util;

/**
 * Dummy interface to prevent NoClassDefFoundError in springdoc-openapi 
 * due to Spring Data 3.3.0 removing this class and moving it to org.springframework.data.core.
 */
public interface TypeInformation<T> {
}
