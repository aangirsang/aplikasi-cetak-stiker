package com.girsang.stiker.service

import com.girsang.stiker.model.entity.DataKategori
import com.girsang.stiker.repository.DataKategoriRepository
import org.springframework.stereotype.Service
import java.util.Optional

@Service
class DataKategoriService (
    private val repo: DataKategoriRepository,
    private val deletionService: EntityDeletionService
) {

    fun semuaLevel(): List<DataKategori> = repo.findAll()
    fun cariId(id: Long): Optional<DataKategori> = repo.findById(id)
    fun simpan(dataKategori: DataKategori): DataKategori {
        if(repo.existsByKategoriIgnoreCase(dataKategori.kategori)) {
            throw IllegalArgumentException("Data Kategori ${dataKategori.kategori} Sudah Ada.")
        }

        return repo.save(dataKategori);
    }

    fun update(id: Long, dataKategori: DataKategori): DataKategori {
        val dataLama = repo.findById(id).orElseThrow {
            throw NoSuchElementException ("Data Level dengan id $id tidak ditemukan")
        }

        if (repo.existsByKategoriIgnoreCaseAndIdNot(dataKategori.kategori, id)){
            throw IllegalArgumentException("Data Kategori ${dataKategori.kategori} Sudah Ada.")
        }
        dataLama.kategori = dataKategori.kategori
        return repo.save(dataLama)
    }

    fun hapus(id: Long) {
        if (!repo.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataKategori::class.java, id)
    }
}