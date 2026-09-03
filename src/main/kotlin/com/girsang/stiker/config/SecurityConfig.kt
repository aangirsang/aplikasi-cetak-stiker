package com.girsang.stiker.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val corsConfigurationSource: CorsConfigurationSource
) {

    @Bean
    fun authenticationManager(
        configuration: AuthenticationConfiguration
    ): AuthenticationManager {
        return configuration.authenticationManager
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun securityFilterChain(
        http: HttpSecurity
    ): SecurityFilterChain {

        http
            .cors { it.configurationSource(corsConfigurationSource) }

            .csrf { it.disable() }

            .authorizeHttpRequests {

                it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                it.requestMatchers(
                    "/",
                    "/index.html",
                    "/error",
                    "/favicon.ico",

                    "/css/**",
                    "/js/**",
                    "/images/**",

                    "/assets/**",
                    "/pages/**",

                    "/api/data-pengguna/ping",

                    "/api/auth/login"
                ).permitAll()

                it.requestMatchers(
                    "/admin/**"
                ).hasRole("ADMIN")

                it.anyRequest()
                    .authenticated()
            }

            .formLogin {
                it.disable()
            }

            .httpBasic {
                it.disable()
            }

            .logout {
                it.logoutUrl("/api/auth/logout")
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID")
            }

        return http.build()
    }
}