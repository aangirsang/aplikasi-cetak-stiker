package com.girsang.stiker.model.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.validation.constraints.NotBlank

@Entity
class DataLevel (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @field:NotBlank(message = "Data Level tidak boleh kosong")
    var level: String = "",

//    @OneToMany(mappedBy = "dataLevel", fetch = FetchType.LAZY, targetEntity = DataPengguna::class)
//    @JsonIgnore // supaya JSON tidak error lazy loading
//    var daftarPengguna: List<DataPengguna> = mutableListOf()
)