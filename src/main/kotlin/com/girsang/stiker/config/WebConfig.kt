package com.girsang.stiker.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.io.File
import java.nio.file.Paths

@Configuration
class WebConfig(

    @Value("\${app.data.dir}")
    private val dataDir: String

) : WebMvcConfigurer {

    override fun addResourceHandlers(
        registry: ResourceHandlerRegistry
    ) {

        val uploadPath =
            File(dataDir, "uploads")
                .absoluteFile
                .toURI()
                .toString()

        println("Resource Path: $uploadPath")

        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath)
    }
}