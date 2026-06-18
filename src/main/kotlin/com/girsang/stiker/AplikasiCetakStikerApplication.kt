package com.girsang.stiker

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class AplikasiCetakStikerApplication

fun main(args: Array<String>) {
	runApplication<AplikasiCetakStikerApplication>(*args)
}
