package com.girsang.stiker.service.master

import com.girsang.stiker.model.entity.DataKategori
import com.girsang.stiker.repository.DataKategoriRepository
import com.girsang.stiker.service.EntityDeletionService
import org.springframework.stereotype.Service

@Service
class DataKategoriService (
    private val repo: DataKategoriRepository,
    private val deletionService: EntityDeletionService
) {

    fun semuaLevel(): List<DataKategori> = repo.findAll()
    fun cariId(id: String): DataKategori =
        repo.findById(id)
            .orElseThrow {
                IllegalArgumentException("Kategori tidak ditemukan")
            }
    fun simpan(dataKategori: DataKategori): DataKategori {
        if(repo.existsByKategoriIgnoreCase(dataKategori.kategori)) {
            throw IllegalArgumentException("Data Kategori ${dataKategori.kategori} Sudah Ada.")
        }

        return repo.save(dataKategori);
    }

    fun update(id: String, dataKategori: DataKategori): DataKategori {
        val dataLama = repo.findById(id).orElseThrow {
            throw NoSuchElementException ("Data Level dengan id $id tidak ditemukan")
        }

        if (repo.existsByKategoriIgnoreCaseAndIdNot(dataKategori.kategori, id)){
            throw IllegalArgumentException("Data Kategori ${dataKategori.kategori} Sudah Ada.")
        }
        dataLama.kategori = dataKategori.kategori
        return repo.save(dataLama)
    }

    fun hapus(id: String) {
        if (!repo.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataKategori::class.java, id)
    }
}