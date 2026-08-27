plugins {
	kotlin("jvm") version "2.3.21"
	kotlin("plugin.spring") version "2.3.21"
	kotlin("plugin.jpa") version "2.3.21"

	id("org.springframework.boot") version "4.1.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.girsang"
version = "1.0.0"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

dependencies {

	// ==============================
	// SPRING BOOT
	// ==============================

	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-validation")

	// ==============================
	// KOTLIN
	// ==============================

	implementation("org.jetbrains.kotlin:kotlin-reflect")

	// ==============================
	// JACKSON
	// ==============================

	implementation("tools.jackson.module:jackson-module-kotlin")

	// ==============================
	// HIBERNATE SQLITE
	// ==============================

	implementation("org.hibernate.orm:hibernate-community-dialects")

	// ==============================
	// IMAGE
	// ==============================

	implementation("net.coobird:thumbnailator:0.4.20")
	implementation("org.sejda.imageio:webp-imageio:0.1.6")

	// ==============================
	// SQLITE
	// ==============================

	runtimeOnly("org.xerial:sqlite-jdbc")

	// ==============================
	// TEST
	// ==============================

	testImplementation("org.springframework.boot:spring-boot-starter-data-jpa-test")
	testImplementation("org.springframework.boot:spring-boot-starter-security-test")
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")

	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll(
			"-Xjsr305=strict",
			"-Xannotation-default-target=param-property"
		)
	}
}

allOpen {
	annotation("jakarta.persistence.Entity")
	annotation("jakarta.persistence.MappedSuperclass")
	annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

tasks.processResources {
	duplicatesStrategy = DuplicatesStrategy.INCLUDE
}

tasks.bootJar {
	archiveFileName.set("aplikasi-cetak-stiker.jar")
}