use ic_cdk::update;
use std::cell::RefCell;


thread_local! {
    static CURRENT_CODE: RefCell<Option<String>> = RefCell::new(None);
}


#[update]
fn generate_code() -> String {
    let code = generate_simple_code(6);

    
    CURRENT_CODE.with(|c| {
        *c.borrow_mut() = Some(code.clone());
    });

    code
}


#[update]
fn validate_code(input: String) -> bool {
    CURRENT_CODE.with(|c| {
        let mut stored = c.borrow_mut();
        if let Some(code) = &*stored {
            if code == &input {
                *stored = None;
                return true;
            }
        }
        false
    })
}



fn generate_simple_code(length: usize) -> String {
    let charset = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mut result = String::new();

    let mut seed = ic_cdk::api::time(); 

    for _ in 0..length {
        let idx = (seed % charset.len() as u64) as usize;
        result.push(charset[idx] as char);
        seed = seed.wrapping_mul(1664525).wrapping_add(1013904223);
    }

    result
}



ic_cdk::export_candid!();