package com.girsang.stiker.service

import com.girsang.stiker.model.entity.DataLevel
import com.girsang.stiker.repository.DataLevelRepository
import org.springframework.stereotype.Service
import java.util.Optional

@Service
class DataLevelService (
    private val repo: DataLevelRepository,
    private val deletionService: EntityDeletionService
) {

    fun semuaLevel(): List<DataLevel> = repo.findAll()
    fun cariId(id: String): DataLevel =
        repo.findById(id)
            .orElseThrow {
                IllegalArgumentException("Level tidak ditemukan")
            }
    fun simpan(dataLevel: DataLevel): DataLevel {
        if(repo.existsByLevelIgnoreCase(dataLevel.level)) {
            throw IllegalArgumentException("Data Level ${dataLevel.level} Sudah Ada.")
        }

        return repo.save(dataLevel)
    }

    fun update(id: String, dataLevel: DataLevel): DataLevel {
        val dataLama = repo.findById(id).orElseThrow {
            throw NoSuchElementException ("Data Level dengan id $id tidak ditemukan")
        }

        if(repo.existsByLevelIgnoreCaseAndIdNot(dataLevel.level, id)) {
            throw IllegalArgumentException("Data Level ${dataLevel.level} Sudah Ada.")
        }

        dataLama.level = dataLevel.level
        return repo.save(dataLama)
    }

    fun hapus(id: String) {
        if (!repo.existsById(id)) throw NoSuchElementException("Data tidak ditemukan")
        deletionService.safeDelete(DataLevel::class.java, id)
    }
}