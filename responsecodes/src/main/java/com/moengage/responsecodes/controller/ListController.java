package com.moengage.responsecodes.controller;

import com.moengage.responsecodes.dto.FilterRequest;
import com.moengage.responsecodes.dto.SaveListRequest;
import com.moengage.responsecodes.model.ResponseCodeItem;
import com.moengage.responsecodes.model.ResponseList;
import com.moengage.responsecodes.model.User;
import com.moengage.responsecodes.repository.ResponseCodeItemRepo;
import com.moengage.responsecodes.repository.ResponseListRepository;
import com.moengage.responsecodes.repository.UserRepository;
import com.moengage.responsecodes.service.ListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/lists")
public class ListController {

    @Autowired
    private ListService listService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ResponseListRepository listRepo;

    @Autowired
    private ResponseCodeItemRepo itemRepo;

    // 1. Filter codes with pattern
    @PostMapping("/filter")
    public ResponseEntity<?> filterCodes(@RequestBody FilterRequest request) {
        List<String> filtered = listService.filterCodes(request.getPattern());
        return ResponseEntity.ok(filtered);
    }

    // 2. Save list with response codes
    @PostMapping("/save")
    public ResponseEntity<?> saveList(@RequestBody SaveListRequest request, Principal principal) {
        User user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        listService.saveList(request.getListName(), request.getResponseCodes(), user);
        return ResponseEntity.ok("List saved successfully.");
    }

    // 3. Get all lists for the logged-in user
    @GetMapping
    public ResponseEntity<?> getUserLists(Principal principal) {
        User user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<ResponseList> lists = listRepo.findByUserId(user.getId());
        return ResponseEntity.ok(lists);
    }

    // 4. Get all items in a specific list
    @GetMapping("/{listId}/items")
    public ResponseEntity<?> getListItems(@PathVariable Long listId) {
        List<ResponseCodeItem> items = itemRepo.findByResponseListId(listId);
        return ResponseEntity.ok(items);
    }

    // 5. Delete a list by ID
    @DeleteMapping("/{listId}")
    public ResponseEntity<?> deleteList(@PathVariable Long listId, Principal principal) {
        Optional<ResponseList> listOpt = listRepo.findById(listId);
        if (listOpt.isPresent()) {
            ResponseList list = listOpt.get();
            if (!list.getUser().getEmail().equals(principal.getName())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }
            itemRepo.deleteAll(itemRepo.findByResponseListId(listId));
            listRepo.deleteById(listId);
            return ResponseEntity.ok("List deleted");
        }
        return ResponseEntity.status(404).body("List not found");
    }

    // 6. Edit a list's name
    @PutMapping("/{listId}")
    public ResponseEntity<?> updateListName(@PathVariable Long listId, @RequestParam String newName, Principal principal) {
        Optional<ResponseList> listOpt = listRepo.findById(listId);
        if (listOpt.isPresent()) {
            ResponseList list = listOpt.get();
            if (!list.getUser().getEmail().equals(principal.getName())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }
            list.setName(newName);
            listRepo.save(list);
            return ResponseEntity.ok("List name updated");
        }
        return ResponseEntity.status(404).body("List not found");
    }
}
