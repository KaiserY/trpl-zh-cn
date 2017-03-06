## 处理环境变量

> [ch12-05-working-with-environment-variables.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-05-working-with-environment-variables.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

让我们再增加一个功能：大小写不敏感搜索。另外，这个设定将不是一个命令行参数：相反它将是一个环境变量。当然可以选择创建一个大小写不敏感的命令行参数，不过用户要求提供一个环境变量这样设置一次之后在整个终端会话中所有的搜索都将是大小写不敏感的了。

### 实现并测试一个大小写不敏感`grep`函数

首先，让我们增加一个新函数，当设置了环境变量时会调用它。增加一个新测试并重命名已经存在的那个：

```rust,ignore
#[cfg(test)]
mod test {
    use {grep, grep_case_insensitive};

    #[test]
    fn case_sensitive() {
        let search = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(
            vec!["safe, fast, productive."],
            grep(search, contents)
        );
    }

    #[test]
    fn case_insensitive() {
        let search = "rust";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            grep_case_insensitive(search, contents)
        );
    }
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

我们将定义一个叫做`grep_case_insensitive`的新函数。它的实现与`grep`函数大体上相似，不过列表 12-16 展示了一些小的区别：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
fn grep_case_insensitive<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    let search = search.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&search) {
            results.push(line);
        }
    }

    results
}
```

<figcaption>

Listing 12-16: Implementing a `grep_case_insensitive` function by changing the
search string and the lines of the contents to lowercase before comparing them

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

首先，将`search`字符串转换为小写，并存放于一个同名的覆盖变量中。注意现在`search`是一个`String`而不是字符串 slice，所以在将`search`传递给`contains`时需要加上 &，因为`contains`获取一个字符串 slice。

