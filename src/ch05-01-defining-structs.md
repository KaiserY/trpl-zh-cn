## 定义并实例化结构体

> [ch05-01-defining-structs.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch05-01-defining-structs.md)
> <br>
> commit 56352c28cf3fe0402fa5a7cba73890e314d720eb

我们在第三章讨论过，结构体与元组类似。就像元组，结构体的每一部分可以是不同类型。不同于元组，需要命名各部分数据以便能清楚的表明其值的意义。由于有了这些名字使得结构体比元组更灵活：不需要依赖顺序来指定或访问实例中的值。

为了定义结构体，通过 `struct` 关键字并为整个结构体提供一个名字。结构体的名字需要描述它所组合的数据的意义。接着，在大括号中，定义每一部分数据的名字，他们被称作 **字段**（*field*），并定义字段类型。例如，示例 5-1 展示了一个储存用户账号信息的结构体：

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

<span class="caption">示例 5-1：`User` 结构体定义</span>

一旦定义了结构体后为了使用它，通过为每个字段指定具体值来创建这个结构体的 **实例**。创建一个实例需要以结构体的名字开头，接着在大括号中使用 `key: value` 对的形式提供字段，其中 key 是字段的名字而 value 是需要储存在字段中的数据值。这时字段的顺序并不必要与在结构体中声明他们的顺序一致。换句话说，结构体的定义就像一个这个类型的通用模板，而实例则会在这个模板中放入特定数据来创建这个类型的值。例如，可以像示例 5-2 这样来声明一个特定的用户：

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

<span class="caption">示例 5-2：创建 `User` 结构体的实例</span>

为了从结构体中获取某个值，可以使用点号。如果我们只想要用户的邮箱地址，可以用 `user1.email`。要更改结构体中的值，如果结构体的实例是可变的，我们可以使用点号并对对应的字段赋值。示例 5-3 展示了如何改变一个可变的 `User` 实例 `email` 字段的值：

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
let mut user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};

user1.email = String::from("anotheremail@example.com");
```

<span class="caption">示例 5-3：改变 `User` 结构体 `email` 字段的值</span>

与其他任何表达式一样，我们可以在函数体的最后一个表达式构造一个结构体，从函数隐式的返回一个结构体的新实例。表 5-4 显示了一个返回带有给定的 `email` 与 `username` 的 `User` 结构体的实例的 `build_user` 函数。`active` 字段的值为 `true`，并且 `sign_in_count` 的值为 `1`。

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

<span class="caption">示例 5-4：`build_user` 函数获取 email 和用户名并返回 `User` 实例</span>

不过，重复 `email` 字段与 `email` 变量的名字，同样的对于`username`，感觉有一点无趣。将函数参数起与结构体字段相同的名字是可以理解的，但是如果结构体有更多字段，重复他们是十分烦人的。幸运的是，这里有一个方便的语法！

### 变量与字段同名时的字段初始化语法

如果有变量与字段同名的话，你可以使用 **字段初始化语法**（*field init shorthand*）。这可以让创建新的结构体实例的函数更为简练。

在示例 5-4 中，名为 `email` 与 `username` 的参数与结构体 `User` 的字段 `email` 和 `username` 同名。因为名字相同，我们可以写出不重复 `email` 和 `username` 的 `build_user` 函数，如示例 5-5 所示。 这个版本的函数与示例 5-4 中代码的行为完全相同。这个字段初始化语法可以让这类代码更简洁，特别是当结构体有很多字段的时候。

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

<span class="caption">示例 5-5：`build_user` 函数使用了字段初始化语法，因为 `email` 和 `username` 参数与结构体字段同名</span>

### 使用结构体更新语法从其他对象创建对象

可以从老的对象创建新的对象常常是很有帮助的，即复用大部分老对象的值并只改变一部分。示例 5-6 展示了一个设置 `email` 与 `username` 的值但其余字段使用与示例 5-2 中 `user1` 实例相同的值以创建新的 `User` 实例 `user2` 的例子：

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
# let user1 = User {
#     email: String::from("someone@example.com"),
#     username: String::from("someusername123"),
#     active: true,
#     sign_in_count: 1,
# };
#
let user2 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    active: user1.active,
    sign_in_count: user1.sign_in_count,
};
```

<span class="caption">示例 5-6：创建 `User` 新实例，`user2`，并将一些字段的值设置为 `user1` 同名字段的值</span>

**结构体更新语法**（*struct update syntax*）可以利用更少的代码获得与示例 5-6 相同的效果。结构体更新语法利用 `..` 以指定未显式设置的字段应有与给定实例对应字段相同的值。示例 5-7 中的代码同样地创建了有着不同的 `email` 与 `username` 值但 `active` 和 `sign_in_count` 字段与 `user1` 相同的实例 `user2`：

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
# let user1 = User {
#     email: String::from("someone@example.com"),
#     username: String::from("someusername123"),
#     active: true,
#     sign_in_count: 1,
# };
#
let user2 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    ..user1
};
```

<span class="caption">示例 5-7：使用结构体更新语法为 `User` 实例设置新的 `email` 和 `username` 值，但使用 `user1` 变量中剩下字段的值</span>

### 使用没有命名字段的元组结构体创建不同的类型

也可以定义与元组相像的结构体，称为 **元组结构体**（*tuple structs*），有着结构体名称提供的含义，但没有具体的字段名只有字段的类型。元组结构体的定义仍然以`struct` 关键字与结构体名称，接下来是元组的类型。如以下是命名为 `Color`  与`Point` 的元组结构体的定义与使用：

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

注意 `black` 和 `origin` 变量有不同的类型，因为他们是不同的元组结构体的实例。我们定义的每一个结构体有着自己的类型，即使结构体中的字段有相同的类型。在其他方面，元组结构体类似我们在第三章提到的元组。

### 没有任何字段的类单元结构体

我们也可以定义一个没有任何字段的结构体！他们被称为 **类单元结构体**（*unit-like structs*）因为他们类似于 `()`，即 unit 类型。类单元结构体常常在你想要在某个类型上实现 trait 但不需要在类型内存储数据的时候发挥作用。我们将在第十章介绍 trait。

> ## 结构体数据的所有权
>
> 在示例 5-1 中的 `User` 结构体的定义中，我们使用了自身拥有所有权的 `String` 类型而不是 `&str` 字符串 slice 类型。这是一个有意而为之的选择，因为我们想要这个结构体拥有它所有的数据，为此只要整个结构体是有效的话其数据也应该是有效的。
>
> 可以使结构体储存被其他对象拥有的数据的引用，不过这么做的话需要用上 **生命周期**（*lifetimes*），这是一个第十章会讨论的 Rust 功能。生命周期确保结构体引用的数据有效性跟结构体本身保持一致。如果你尝试在结构体中储存一个引用而不指定生命周期，比如这样：
>
> <span class="filename">文件名: src/main.rs</span>
>
> ```rust,ignore
> struct User {
>     username: &str,
>     email: &str,
>     sign_in_count: u64,
>     active: bool,
> }
>
> fn main() {
>     let user1 = User {
>         email: "someone@example.com",
>         username: "someusername123",
>         active: true,
>         sign_in_count: 1,
>     };
> }
> ```
>
> 编译器会抱怨它需要生命周期标识符：
>
> ```text
> error[E0106]: missing lifetime specifier
>  -->
>   |
> 2 |     username: &str,
>   |               ^ expected lifetime parameter
>
> error[E0106]: missing lifetime specifier
>  -->
>   |
> 3 |     email: &str,
>   |            ^ expected lifetime parameter
> ```
>
> 第十章会讲到如何修复这个问题以便在结构体中储存引用，不过现在，我们会使用像 `String` 这类拥有所有权的类型来替代 `&str` 这样的引用以修正这个错误。
