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
class DataBarangRusak (
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    var dataBarang: DataBarang,

    var jumlah: Long,

    @field:NotBlank(message = "Catatan tidak boleh kosong")
    @Column(nullable = false)
    var catatan: String,

    @Column(nullable = true)
    var pathGambar: String = "",
)