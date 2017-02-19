## `if let`简单控制流

> [ch06-03-if-let.md](https://github.com/rust-lang/book/blob/master/src/ch06-03-if-let.md)
> <br>
> commit 396e2db4f7de2e5e7869b1f8bc905c45c631ad7d

`if let`语法让我们以一种不那么冗长的方式结合`if`和`let`，来处理匹配一个模式的值而忽略其他的值。考虑列表 6-6 中的程序，它匹配一个`Option<u8>`值并只希望当值是三时执行代码：

<figure>

```rust
let some_u8_value = Some(0u8);
match some_u8_value {
    Some(3) => println!("three"),
    _ => (),
}
```

<figcaption>

Listing 6-6: A `match` that only cares about executing code when the value is
`Some(3)`

</figcaption>
</figure>

