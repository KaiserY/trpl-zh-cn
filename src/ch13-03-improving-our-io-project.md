## 改进 I/O 项目

> [ch13-03-improving-our-io-project.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-03-improving-our-io-project.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

在我们上一章实现的`grep` I/O 项目中，其中有一些地方的代码可以使用迭代器来变得更清楚简洁一些。让我们看看迭代器如何能够改进`Config::new`函数和`grep`函数的实现。

### 使用迭代器并去掉`clone`

回到列表 12-8 中，这些代码获取一个`String` slice 并创建一个`Config`结构体的实例，它检查参数的数量、索引 slice 中的值、并克隆这些值以便`Config`可以拥有他们的所有权：

```rust,ignore
impl Config {
    fn new(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let search = args[1].clone();
        let filename = args[2].clone();

        Ok(Config {
            search: search,
            filename: filename,
        })
    }
}
```

当时我们说不必担心这里的`clone`调用，因为将来会移除他们。好吧，就是现在了！所以，为什么这里需要`clone`呢？这里的问题是参数`args`中有一个`String`元素的 slice，而`new`函数并不拥有`args`。为了能够返回`Config`实例的所有权，我们需要克隆`Config`中字段`search`和`filename`的值，这样`Config`就能拥有这些值了。

现在在认识了迭代器之后，我们可以将`new`函数改为获取一个有所有权的迭代器作为参数。可以使用迭代器来代替之前必要的 slice 长度检查和特定位置的索引。因为我们获取了迭代器的所有权，就不再需要借用所有权的索引操作了，我们可以直接将迭代器中的`String`值移动到`Config`中，而不用调用`clone`来创建一个新的实例。

首先，让我们看看列表 12-6 中的`main`函数，将`env::args`的返回值改为传递给`Config::new`，而不是调用`collect`并传递一个 slice：

```rust,ignore
fn main() {
    let config = Config::new(env::args());
    // ...snip...
```

<!-- Will add ghosting in libreoffice /Carol -->

如果参看标准库中`env::args`函数的文档，我们会发现它的返回值类型是`std::env::Args`。所以下一步就是更新`Config::new`的签名使得参数`args`拥有`std::env::Args`类型而不是`&[String]`：

```rust,ignore
impl Config {
    fn new(args: std::env::Args) -> Result<Config, &'static str> {
        // ...snip...
```

<!-- Will add ghosting in libreoffice /Carol -->

之后我们将修复`Config::new`的函数体。因为标准库文档也表明，`std::env::Args`实现了`Iterator` trait，所以我们知道可以调用其`next`方法！如下就是新的代码：

```rust
# struct Config {
#     search: String,
#     filename: String,
# }
#
impl Config {
    fn new(mut args: std::env::Args) -> Result<Config, &'static str> {
    	args.next();

        let search = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a search string"),
        };

        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file name"),
        };

        Ok(Config {
            search: search,
            filename: filename,
        })
    }
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

还记得`env::args`返回值的第一个值是程序的名称吗。我们希望忽略它，所以首先调用`next`并不处理其返回值。第二次调用`next`的返回值应该是希望放入`Config`中`search`字段的值。使用`match`来在`next`返回`Some`时提取值，而在因为没有足够的参数（这会造成`next`调用返回`None`）而提早返回`Err`值。

对`filename`值也进行相同处理。稍微有些可惜的是`search`和`filename`的`match`表达式是如此的相似。如果可以对`next`返回的`Option`使用`?`就好了，不过目前`?`只能用于`Result`值。即便我们可以像`Result`一样对`Option`使用`?`，得到的值也是借用的，而我们希望能够将迭代器中的`String`移动到`Config`中。

### 使用迭代器适配器来使代码更简明

另一部分可以利用迭代器的代码位于列表 12-15 中实现的`grep`函数中：

<!-- We hadn't had a listing number for this code sample when we submitted
chapter 12; we'll fix the listing numbers in that chapter after you've
reviewed it. /Carol -->

```rust
fn grep<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(search) {
            results.push(line);
        }
    }

    results
}
```

我们可以用一种更简短的方式来编写这些代码，并避免使用了一个作为可变中间值的`results` vector，像这样使用迭代器适配器方法来实现：

```rust
fn grep<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    contents.lines()
        .filter(|line| line.contains(search))
        .collect()
}
```

这里使用了`filter`适配器来只保留`line.contains(search)`为真的那些行。接着使用`collect`将他们放入另一个 vector 中。这就简单多了！

也可以对列表 12-16 中定义的`grep_case_insensitive`函数使用如下同样的技术：

<!-- Similarly, the code snippet that will be 12-16 didn't have a listing
number when we sent you chapter 12, we will fix it. /Carol -->

```rust
fn grep_case_insensitive<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    let search = search.to_lowercase();

    contents.lines()
        .filter(|line| {
            line.to_lowercase().contains(&search)
        }).collect()
}
```

看起来还不坏！那么到底该用哪种风格呢？大部分 Rust 程序员倾向于使用迭代器风格。开始这有点难以理解，不过一旦你对不同迭代器的工作方式有了直觉上的理解之后，他们将更加容易理解。相比使用很多看起来大同小异的循环并创建一个 vector，抽象出这些老生常谈的代码将使得我们更容易看清代码所特有的概念，比如迭代器中用于过滤每个元素的条件。

不过他们真的完全等同吗？当然更底层的循环会更快一些。让我们聊聊性能吧。