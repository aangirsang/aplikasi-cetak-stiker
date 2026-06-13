package com.girsang.stiker.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.validation.constraints.NotBlank

@Entity
data class DataPengguna(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @field:NotBlank(message = "Nama lengkap tidak boleh kosong")
    var namaLengkap: String = "",

    @field:NotBlank(message = "Nama pengguna tidak boleh kosong")
    @Column(nullable = false, unique = true)
    var namaPengguna: String = "",

    @field:NotBlank(message = "Kata sandi tidak boleh kosong")
    @Column(nullable = false)
    var kataSandi: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "data_level_id")
    var dataLevel: DataLevel,

    var status: Boolean = true,
    var pathGambar: String = ""
)