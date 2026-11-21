package com.girsang.stiker.config

import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
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

            .exceptionHandling { exceptions ->
                exceptions
                    // Belum login / token & session tidak valid -> 401
                    .authenticationEntryPoint { request, response, _ ->
                        response.status = HttpStatus.UNAUTHORIZED.value()
                        response.contentType = "application/json"
                        response.writer.write(
                            """{"success":false,"message":"Belum login"}"""
                        )
                    }
                    // Sudah login tapi role tidak cukup (mis. akses /admin/**) -> 403
                    .accessDeniedHandler { request, response, _ ->
                        response.status = HttpStatus.FORBIDDEN.value()
                        response.contentType = "application/json"
                        response.writer.write(
                            """{"success":false,"message":"Tidak punya akses"}"""
                        )
                    }
            }

            .logout {
                it.logoutUrl("/api/auth/logout")
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("JSESSIONID", "token")   // ganti "token" dengan nama cookie Anda
                    .logoutSuccessHandler { _, response, _ ->
                        response.status = HttpServletResponse.SC_OK
                    }
            }


        return http.build()
    }
}