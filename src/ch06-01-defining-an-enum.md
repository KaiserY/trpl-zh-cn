# 定义枚举

> [ch06-01-defining-an-enum.md](https://github.com/rust-lang/book/blob/master/src/ch06-01-defining-an-enum.md)
> <br>
> commit 396e2db4f7de2e5e7869b1f8bc905c45c631ad7d

让我们通过一用代码来表现的场景，来看看为什么这里枚举是有用的而且比结构体更合适。比如我们要处理 IP 地。目前被广泛使用的两个主要 IP 标准：IPv4（version four）和 IPv6（version six）。这是我们的程序只可能会遇到两种 IP 地址：我们可以**枚举**出所有可能的值，这也正是它名字的由来。

任何一个 IP 地址要么是 IPv4 的要么是 IPv6 的而不能两者都是。IP 地址的这个特性使得枚举数据结构非常适合这个场景，因为枚举值尽可能是其一个成员。IPv4 和 IPv6 从根本上讲都是 IP 地址，所以当代码在处理申请任何类型的 IP 地址的场景时应该把他们当作相同的类型。

可以通过在代码中定义一个`IpAddrKind`枚举来表现这个概念并列出可能的 IP 地址类型，`V4`和`V6`。这被称为枚举的**成员**（*variants*）：

```rust
enum IpAddrKind {
    V4,
    V6,
}
```

现在`IpAddrKind`就是一个可以在代码中使用的自定义类型了。

### 枚举值

可以像这样创建`IpAddrKind`两个不同成员的实例：

```rust
# enum IpAddrKind {
#     V4,
#     V6,
# }
#
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

注意枚举的成员位于其标识符的命名空间中，并使用两个冒号分开。这么设计的益处是现在`IpAddrKind::V4`和`IpAddrKind::V6`是相同类型的：`IpAddrKind`。例如，接着我们可以顶一个函数来获取`IpAddrKind`：

```rust
# enum IpAddrKind {
#     V4,
#     V6,
# }
#
fn route(ip_type: IpAddrKind) { }
```

现在可以使用任意成员来调用这个函数：

```rust
# enum IpAddrKind {
#     V4,
#     V6,
# }
#
# fn route(ip_type: IpAddrKind) { }
#
route(IpAddrKind::V4);
route(IpAddrKind::V6);
```

使用枚举甚至还有更多优势。进一步考虑一下我们的 IP 地址类型，目前没有一个储存实际 IP 地址**数据**的方法；只知道它是什么**类型**的。考虑到已经在第五章学习过结构体了，你可以想如列表 6-1 那样修改这个问题：

<figure>

```rust
enum IpAddrKind {
    V4,
    V6,
}

struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};

let loopback = IpAddr {
    kind: IpAddrKind::V6,
    address: String::from("::1"),
};
```

<figcaption>

Listing 6-1: Storing the data and `IpAddrKind` variant of an IP address using a
`struct`

</figcaption>
</figure>

这里我们定义了一个有两个字段的结构体`IpAddr`：`kind`字段是`IpAddrKind`（之前定义的枚举）类型的而`address`字段是`String`类型的。这里有两个结构体的实例。第一个，`home`，它的`kind`的值是`IpAddrKind::V4`与之相关联的地址数据是`127.0.0.1`。第二个实例，`loopback`，`kind`的值是`IpAddrKind`的另一个成员，`V6`，关联的地址是`::1`。我们使用了要给结构体来将`kind`和`address`打包在一起，现在枚举成员就与值相关联了。

我们可以使用一种更简洁的方式来表达相同的概念，仅仅使用枚举并将数据直接放进每一个枚举成员而不是将枚举作为结构体的一部分。`IpAddr`枚举的新定义表明了`V4`和`V6`成员都关联了`String`值：

```rust
enum IpAddr {
    V4(String),
    V6(String),
}

let home = IpAddr::V4(String::from("127.0.0.1"));

let loopback = IpAddr::V6(String::from("::1"));
```

我们直接将数据附加到枚举的每个成员上，这样就不需要一个额外的结构体了。

使用枚举而不是结构体还有另外一个优势：每个成员可以处理不同类型和数量的数据。