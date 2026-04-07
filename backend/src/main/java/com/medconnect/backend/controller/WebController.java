package com.medconnect.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController {

    // Match all endpoints that don't have an extension (like .js or .css) and don't start with /api
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        // Forward to home page so that React Router can handle it
        return "forward:/index.html";
    }
}
