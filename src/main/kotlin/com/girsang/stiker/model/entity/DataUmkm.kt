package com.girsang.stiker.model.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.girsang.stiker.model.entity.DataKategori
import jakarta.persistence.*
import jakarta.validation.constraints.*

@Entity
@JsonIgnoreProperties("hibernateLazyInitializer", "handler")
data class DataUmkm(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @field:NotBlank(message = "Nama Usaha tidak boleh kosong")
    @Column(nullable = false)
    var namaUsaha: String = "",

    @field:NotBlank(message = "Nama Pemilik Usaha tidak boleh kosong")
    @Column(nullable = false)
    var namaPemilik: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    var dataKategori: DataKategori,

    @Column(nullable = true)
    var deskripsi: String? = null,

    @field:NotNull(message = "Nomor KTP tidak boleh kosong")
    @Column(nullable = false)
    var noKtp: String = "",

    @Column(nullable = false)
    var jenisKelamin: Boolean = true,

    @Column(nullable = false)
    var tglLahir: Long,

    @field:NotBlank(message = "Nomor telpon tidak boleh kosong")
    @Column(nullable = false, columnDefinition = "TEXT")
    var noTelpon: String = "",

    @field:Email(message = "Format email tidak valid")
    @field:NotBlank(message = "Email tidak boleh kosong")
    @Column(nullable = false, unique = true)
    var email: String = "",

    @field:NotBlank(message = "Alamat tidak boleh kosong")
    @Column(nullable = false, columnDefinition = "TEXT")
    var alamat: String = "",

    @Column(nullable = true)
    var whatsapp: String? = null,

    @Column(nullable = true)
    var instagram: String? = null,

    @Column(nullable = true)
    var facebook: String? = null,

    @Column(nullable = true)
    var tiktok: String? = null,

    @Column(nullable = false)
    var status: Boolean = true,

    @Column(nullable = false)
    var tglRegistrasi: Long = 0L,

    // 🔁 OneToMany ke DataStiker
    @OneToMany(mappedBy = "dataUmkm", fetch = FetchType.LAZY, targetEntity = DataStiker::class)
    @JsonIgnore // supaya JSON tidak error lazy loading
    open var daftarStiker: List<DataStiker> = mutableListOf()
)
