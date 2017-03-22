## 方法语法

> [ch05-01-method-syntax.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch05-01-method-syntax.md)
> <br>
> commit 8c1c1a55d5c0f9bc3c866ee79b267df9dc5c04e2

**方法**与函数类似：他们使用`fn`关键和名字声明，他们可以拥有参数和返回值，同时包含一些代码会在某处被调用时执行。不过方法与方法是不同的，因为他们在结构体（或者枚举或者 trait 对象，将分别在第六章和第十七章讲解）的上下文中被定义，并且他们第一个参数总是`self`，它代表方法被调用的结构体的实例。

### 定义方法

让我们将获取一个`Rectangle`实例作为参数的`area`函数改写成一个定义于`Rectangle`结构体上的`area`方法，如列表 5-7 所示：

<span class="filename">Filename: src/main.rs</span>

```rust
#[derive(Debug)]
struct Rectangle {
    length: u32,
    width: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.length * self.width
    }
}

fn main() {
    let rect1 = Rectangle { length: 50, width: 30 };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

<span class="caption">Listing 5-7: Defining an `area` method on the `Rectangle`
struct</span>

<!-- Will add ghosting and wingdings here in libreoffice /Carol -->

为了使函数定义于`Rectangle`的上下文中，我们开始了一个`impl`块（`impl`是 *implementation* 的缩写）。接着将函数移动到`impl`大括号中，并将签名中的第一个（在这里也是唯一一个）参数和函数体中其他地方的对应参数改成`self`。然后在`main`中将我们调用`area`方法并传递`rect1`作为参数的地方，改成使用**方法语法**在`Rectangle`实例上调用`area`方法。方法语法获取一个实例并加上一个点号后跟方法名、括号以及任何参数。

在`area`的签名中，开始使用`&self`来替代`rectangle: &Rectangle`，因为该方法位于`impl Rectangle` 上下文中所以 Rust 知道`self`的类型是`Rectangle`。注意仍然需要在`self`前面加上`&`，就像`&Rectangle`一样。方法可以选择获取`self`的所有权，像我们这里一样不可变的借用`self`，或者可变的借用`self`，就跟其他别的参数一样。

这里选择`&self`跟在函数版本中使用`&Rectangle`出于同样的理由：我们并不想获取所有权，只希望能够读取结构体中的数据，而不是写入。如果想要能够在方法中改变调用方法的实例的话，需要将抵押给参数改为`&mut self`。通过仅仅使用`self`作为第一个参数来使方法获取实例的所有权，不过这是很少见的；这通常用在当方法将`self`转换成别的实例的时候，同时我们想要防止调用者在转换之后使用原始的实例。

使用方法而不是函数，除了使用了方法语法和不需要在每个函数签名中重复`self`类型外，其主要好处在于组织性。我将某个类型实例能做的所有事情都一起放入`impl`块中，而不是让将来的用户在我们的代码中到处寻找`Rectangle`的功能。

<!-- PROD: START BOX -->

> ### `->`运算符到哪去了？
>
> 像在 C++ 这样的语言中，又两个不同的运算符来调用方法：`.`直接在对象上调用方法，而`->`在一个对象的指针上调用方法，这时需要先解引用（dereference）指针。换句话说，如果`object`是一个指针，那么`object->something()`就像`(*object).something()`一样。
>
> Rust 并没有一个与`->`等效的运算符；相反，Rust 有一个叫**自动引用和解引用**（*automatic referencing and dereferencing*）的功能。方法调用是 Rust 中少数几个拥有这种行为的地方。
>
> 这是它如何工作的：当使用`object.something()`调用方法时，Rust 会自动增加`&`、`&mut`或`*`以便使`object`符合方法的签名。也就是说，这些代码是等同的：
>
> ```rust
> # #[derive(Debug,Copy,Clone)]
> # struct Point {
> #     x: f64,
> #     y: f64,
> # }
> #
> # impl Point {
> #    fn distance(&self, other: &Point) -> f64 {
> #        let x_squared = f64::powi(other.x - self.x, 2);
> #        let y_squared = f64::powi(other.y - self.y, 2);
> #
> #        f64::sqrt(x_squared + y_squared)
> #    }
> # }
> # let p1 = Point { x: 0.0, y: 0.0 };
> # let p2 = Point { x: 5.0, y: 6.5 };
> p1.distance(&p2);
> (&p1).distance(&p2);
> ```
>
> 第一行看起来简洁的多。这种自动引用的行为之所以能行得通是因为方法有一个明确的接收者————`self`的类型。在给出接收者和方法名的前提下，Rust 可以明确的计算出方法是仅仅读取（所以需要`&self`），做出修改（所以是`&mut self`）或者是获取所有权（所以是`self`）。Rust 这种使得借用对方法接收者来说是隐式的做法是其所有权系统人体工程学实践的一大部分。

<!-- PROD: END BOX -->

### 带有更多参数的方法

让我们更多的实践一下方法，通过为`Rectangle`结构体实现第二个方法。这回，我们让一个`Rectangle`的实例获取另一个`Rectangle`实例并返回`self`能否完全包含第二个长方形，如果能返回`true`若不能则返回`false`。当我们定义了`can_hold`方法，就可以运行列表 5-8 中的代码了：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let rect1 = Rectangle { length: 50, width: 30 };
    let rect2 = Rectangle { length: 40, width: 10 };
    let rect3 = Rectangle { length: 45, width: 60 };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

<span class="caption">Listing 5-8: Demonstration of using the as-yet-unwritten
`can_hold` method</span>

我们希望看到如下输出，因为`rect2`的长宽都小于`rect1`，而`rect3`比`rect1`要宽：

```
Can rect1 hold rect2? true
Can rect1 hold rect3? false
```

因为我们想定义一个方法，所以它应该位于`impl Rectangle`块中。方法名是`can_hold`，并且它会获取另一个`Rectangle`的不可变借用作为参数。通过观察调用点可以看出参数是什么类型的：`rect1.can_hold(&rect2)`传入了`&rect2`，它是一个`Rectangle`的实例`rect2`的不可变借用。这是可以理解的，因为我们只需要读取`rect2`（而不是写入，这意味着我们需要一个可变借用）而且希望`main`保持`rect2`的所有权这样就可以在调用这个方法后继续使用它。`can_hold`的返回值是一个布尔值，其实现会分别检查`self`的长宽是够都大于另一个`Rectangle`。让我们在列表 5-7 的`impl`块中增加这个新方法，如列表 5-9 所示：

<span class="filename">Filename: src/main.rs</span>

```rust
# #[derive(Debug)]
# struct Rectangle {
#     length: u32,
#     width: u32,
# }
#
impl Rectangle {
    fn area(&self) -> u32 {
        self.length * self.width
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.length > other.length && self.width > other.width
    }
}
```

<span class="caption">Listing 5-9: Implementing the `can_hold` method on 
`Rectangle` that takes another `Rectangle` instance as an argument</span>

<!-- Will add ghosting here in libreoffice /Carol -->

如果结合列表 5-8 的`main`函数来运行，就会看到想要得到的输出！方法可以在`self`后增加多个参数，而且这些参数就像函数中的参数一样工作。

### 关联函数

`impl`块的另一个好用的功能是：允许在`impl`块中定义**不**以`self`作为参数的函数。这被称为**关联函数**（*associated functions*），因为他们与结构体相关联。即便如此他们也是函数而不是方法，因为他们并不作用于一个结构体的实例。你已经使用过一个关联函数了：`String::from`。

关联函数经常被用作返回一个结构体新实例的构造函数。例如我们可以一个关联函数，它获取一个维度参数并且用来作为长宽，这样可以更轻松的创建一个正方形`Rectangle`而不必指定两次同样的值：

<span class="filename">Filename: src/main.rs</span>

```rust
# #[derive(Debug)]
# struct Rectangle {
#     length: u32,
#     width: u32,
# }
#
impl Rectangle {
    fn square(size: u32) -> Rectangle {
        Rectangle { length: size, width: size }
    }
}
```

使用结构体名和`::`语法来调用这个关联函数：比如`let sq = Rectangle::square(3);`。这个方法位于结构体的命名空间中：`::`语法用于关联函数和模块创建的命名空间，第七章会讲到后者。

## 总结

结构体让我们可以在自己的范围内创建有意义的自定义类型。通过结构体，我们可以将相关联的数据片段联系起来并命名他们来使得代码更清晰。方法允许为结构体实例指定行为，而关联函数将特定功能置于结构体的命名空间中并且无需一个实例。

结构体并不是创建自定义类型的唯一方法；让我们转向 Rust 的`enum`功能并为自己的工具箱再填一个工具。