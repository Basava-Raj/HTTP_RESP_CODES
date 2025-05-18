package com.moengage.responsecodes.repository;

import com.moengage.responsecodes.model.ResponseCodeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponseCodeItemRepo extends JpaRepository<ResponseCodeItem, Long> {

    List<ResponseCodeItem> findByResponseListId(long listId);
}
