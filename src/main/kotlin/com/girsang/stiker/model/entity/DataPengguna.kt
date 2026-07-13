package com.girsang.stiker.model.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist

@Entity
class DataPengguna(

    @Id
    var id: String = "",

    var namaLengkap: String = "",

    @Column(nullable = false, unique = true)
    var namaPengguna: String = "",

    @Column(nullable = false)
    var kataSandi: String? = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    var dataLevel: DataLevel,

    var status: Boolean = true,

    var pathGambar: String = "",

    @OneToMany(mappedBy = "dataPengguna", fetch = FetchType.LAZY, targetEntity = DataPembelian::class)
    @JsonIgnore // supaya JSON tidak error lazy loading
    var daftarPembelian: List<DataPembelian> = mutableListOf()

){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "USR-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}