package com.girsang.stiker.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.validation.constraints.NotBlank

@Entity
class DataPenyesuaianStok(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    var stokSistem: Long,
    var stokFisik: Long,
    var selisih: Long,

    @field:NotBlank(message = "Alasan tidak boleh kosong")
    @Column(nullable = false)
    var alasan: String
)