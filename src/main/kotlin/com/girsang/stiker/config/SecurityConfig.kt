package com.girsang.stiker.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(
        http: HttpSecurity
    ): SecurityFilterChain {

        http
            .csrf {
                it.disable()
            }

            .cors { }

            .authorizeHttpRequests {

                // endpoint public
                it.requestMatchers(

                    "/login",
                    "/error",

                    "/css/**",
                    "/js/**",
                    "/images/**",

                    // API
                    "/api/**"

                ).permitAll()

                // halaman admin
                it.requestMatchers(
                    "/admin/**"
                )
                    .hasRole("ADMIN")

                // selain itu wajib login
                it.anyRequest()
                    .authenticated()
            }

            .formLogin {
                it.disable()
            }

            .logout {

                it.logoutUrl("/logout")
                    .logoutSuccessUrl(
                        "/login?logout"
                    )
                    .permitAll()
            }

        return http.build()
    }
}