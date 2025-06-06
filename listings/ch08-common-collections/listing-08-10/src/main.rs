fn main() {
    // ANCHOR: here
    {
        let v = vec![1, 2, 3, 4];

        // 使用v
    } // <- 在这里v离开作用域并被释放
    // ANCHOR_END: here
}
