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
import kotlin.text.isBlank

@Entity
class DataLevel (
    @Id
    var id: String = "",

    @field:NotBlank(message = "Data Level tidak boleh kosong")
    var level: String = "",

    @OneToMany(mappedBy = "dataLevel", fetch = FetchType.LAZY, targetEntity = DataPengguna::class)
    @JsonIgnore // supaya JSON tidak error lazy loading
    var daftarPengguna: List<DataPengguna> = mutableListOf()
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "LVL-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}