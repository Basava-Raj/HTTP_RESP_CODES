package com.moengage.responsecodes.service;

import com.moengage.responsecodes.model.ResponseCodeItem;
import com.moengage.responsecodes.model.ResponseList;
import com.moengage.responsecodes.model.User;
import com.moengage.responsecodes.repository.ResponseCodeItemRepo;
import com.moengage.responsecodes.repository.ResponseListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.moengage.responsecodes.util.ResponseCodeUtils.ALL_CODES;

@Service
public class ListService {

    @Autowired
    private ResponseListRepository listRepo;

    @Autowired
    private ResponseCodeItemRepo itemRepo;

    public List<String> filterCodes(String pattern) {
        String regex = pattern.replace("x", "\\d");
        return ALL_CODES.stream()
                .filter(code -> code.matches(regex))
                .collect(Collectors.toList());
    }

    public void saveList(String name, List<String> codes, User user) {
        ResponseList list = new ResponseList();
        list.setName(name);
        list.setCreatedAt(LocalDateTime.now());
        list.setUser(user);
        listRepo.save(list);

        List<ResponseCodeItem> items = codes.stream()
                .map(code -> {
                    String img = "https://http.dog/" + code + ".jpg";
                    return new ResponseCodeItem(null, code, img, list);
                })
                .collect(Collectors.toList());

        itemRepo.saveAll(items);
    }
}

