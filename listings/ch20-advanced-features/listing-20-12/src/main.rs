// ANCHOR: here
unsafe trait Foo {
    // 方法在这里
}

unsafe impl Foo for i32 {
    // 方法实现在这里
}
// ANCHOR_END: here

fn main() {}
