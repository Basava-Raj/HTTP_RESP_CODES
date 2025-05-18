package com.moengage.responsecodes.dto;

import lombok.Data;

import java.util.List;

@Data
public class SaveListRequest {
    private String listName;
    private List<String> responseCodes;



}
