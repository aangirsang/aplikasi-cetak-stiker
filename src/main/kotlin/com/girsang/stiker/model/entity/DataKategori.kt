package com.girsang.stiker.model.entity


import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist
import jakarta.validation.constraints.NotBlank

@Entity
class DataKategori (
    @Id
    var id: String = "",

    @field:NotBlank(message = "Kategori tidak boleh kosong")
    var kategori: String = "",

    @OneToMany(mappedBy = "dataKategori", fetch = FetchType.LAZY, targetEntity = DataUmkm::class)
    @JsonIgnore // supaya JSON tidak error lazy loading
    var daftarUmkm: List<DataUmkm> = mutableListOf()

){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "KTGR-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}