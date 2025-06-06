fn main() {
    // ANCHOR: here
    {
        let v = vec![1, 2, 3, 4];

        // 使用 v
    } // <- 在这里 v 离开作用域并被释放
    // ANCHOR_END: here
}
