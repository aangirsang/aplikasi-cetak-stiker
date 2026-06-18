package com.girsang.stiker.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class LoginInterceptor : HandlerInterceptor {

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {

        val user =
            request.session
                .getAttribute(
                    "LOGIN_USER"
                )

        if (user == null) {

            response.sendRedirect(
                "/login"
            )

            return false
        }

        return true
    }
}