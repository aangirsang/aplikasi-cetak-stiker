package com.girsang.stiker.model.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist

@Entity
data class DataOrderan (
    @Id
    var id: String = "",

    // 🔗 Relasi ke DataPengguna
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pengguna_id", nullable = false)
    var dataPengguna: DataPengguna,

    // 🔗 Relasi ke DataUMKM
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "umkm_id", nullable = false)
    var dataUMKM: DataUmkm,

    var faktur: String,
    var tanggal: Long,
    var totalStiker: Int,

    @OneToMany(mappedBy = "dataOrderan", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var rincian: MutableList<DataOrderanRinci> = mutableListOf()
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "ORDR-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}