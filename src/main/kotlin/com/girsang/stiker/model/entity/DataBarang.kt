package com.girsang.stiker.model.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist
import jakarta.validation.constraints.NotBlank

@Entity
class DataBarang (
    @Id
    var id: String = "",

    @field:NotBlank(message = "Nama barang tidak boleh kosong")
    var namaBarang: String,

    var stokBarang: Long = 0,

    @OneToMany(mappedBy = "dataBarang", fetch = FetchType.LAZY, targetEntity = DataPembelianRinci::class)
    @JsonIgnore
    open var daftarPembelian: MutableList<DataPembelianRinci> = mutableListOf(),

    @OneToMany(mappedBy = "dataBarang", fetch = FetchType.LAZY, targetEntity = DataRiwayatStok::class)
    @JsonIgnore
    open var daftarRiwayatStok: MutableList<DataRiwayatStok> = mutableListOf()

){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "BRG-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}