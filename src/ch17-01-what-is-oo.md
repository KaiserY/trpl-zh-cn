## 什么是面向对象？

> [ch17-01-what-is-oo.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-01-what-is-oo.md)
> <br>
> commit 2a9b2a1b019ad6d4832ff3e56fbcba5be68b250e

关于一门语言是否需要是面向对象，在编程社区内并未达成一致意见。Rust 被很多不同的编程范式影响，我们探索了十三章提到的函数式编程的特性。面向对象编程语言的一些特性往往是对象、封装和继承。我们看一下这每一个概念的含义以及 Rust 是否支持他们。

## 对象包含数据和行为

`Design Patterns: Elements of Reusable Object-Oriented Software`这本书被俗称为`The Gang of Four book`，是面向对象编程模式的目录。它这样定义面向对象编程：

> Object-oriented programs are made up of objects. An *object* packages both
> data and the procedures that operate on that data. The procedures are
> typically called *methods* or *operations*.
>
> 面向对象的程序是由对象组成的。一个**对象**包含数据和操作这些数据的过程。这些过程通常被称为**方法**或**操作**。

在这个定义下，Rust 是面向对象的：结构体和枚举包含数据而 impl 块提供了在结构体和枚举之上的方法。虽然带有方法的结构体和枚举并不被**称为**对象，但是他们提供了与对象相同的功能，参考 Gang of Four 所定义的对象。

## 隐藏了实现细节的封装

另一个通常与面向对象编程相关的方面是**封装**的思想：对象的实现细节不能被使用对象的代码获取到。唯一与对象交互的方式是通过对象提供的公有 API；使用对象的代码无法深入到对象内部并直接改变数据或者行为。封装使得改变和重构对象的内部时无需改变使用对象的代码。

就像我们在第七章讨论的那样，可以使用`pub`关键字来决定模块、类型函数和方法是公有的，而默认情况下一切都是私有的。比如，我们可以定义一个包含一个`i32`类型的 vector 的结构体`AveragedCollection `。结构体也可以有一个字段，该字段保存了 vector 中所有值的平均值。这样，希望知道结构体中的 vector 的平均值的人可以随时获取它，而无需自己计算。`AveragedCollection`会为我们缓存平均值结果。列表 17-1 有`AveragedCollection`结构体的定义：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct AveragedCollection {
    list: Vec<i32>,
    average: f64,
}
```

<span class="caption">列表 17-1: `AveragedCollection`结构体维护了一个整型列表和集合中所有元素的平均值。</span>

注意，结构体自身被标记为`pub`，这样其他代码可以使用这个结构体，但是在结构体内部的字段仍然是私有的。这是非常重要的，因为我们希望保证变量被增加到列表或者被从列表删除时，也会同时更新平均值。我们通过在结构体上实现`add`、`remove`和`average`方法来做到这一点，如列表 17-2 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct AveragedCollection {
#     list: Vec<i32>,
#     average: f64,
# }
impl AveragedCollection {
    pub fn add(&mut self, value: i32) {
        self.list.push(value);
        self.update_average();
    }

    pub fn remove(&mut self) -> Option<i32> {
        let result = self.list.pop();
        match result {
            Some(value) => {
                self.update_average();
                Some(value)
            },
            None => None,
        }
    }

    pub fn average(&self) -> f64 {
        self.average
    }

    fn update_average(&mut self) {
        let total: i32 = self.list.iter().sum();
        self.average = total as f64 / self.list.len() as f64;
    }
}
```

<span class="caption">列表 17-2: 在`AveragedCollection`结构体上实现了`add`、`remove`和`average`公有方法</span>

公有方法`add`、`remove`和`average`是修改`AveragedCollection`实例的唯一方式。当使用`add`方法把一个元素加入到`list`或者使用`remove`方法来删除它时，这些方法的实现同时会调用私有的`update_average`方法来更新`average`字段。因为`list`和`average`是私有的，没有其他方式来使得外部的代码直接向`list`增加或者删除元素，直接操作`list`可能会引发`average`字段不同步。`average`方法返回`average`字段的值，这使得外部的代码只能读取`average`而不能修改它。

因为我们已经封装好了`AveragedCollection`的实现细节，将来可以轻松改变类似数据结构这些方面的内容。例如，可以使用`HashSet`代替`Vec`作为`list`字段的类型。只要`add`、`remove`和`average`公有函数的签名保持不变，使用`AveragedCollection`的代码就无需改变。如果将`List`暴露给外部代码时，未必都是这样，因为`HashSet`和`Vec`使用不同的方法增加或移除项，所以如果要想直接修改`list`的话，外部的代码可能不得不修改。

如果封装是一个语言被认为是面向对象语言所必要的方面的话，那么 Rust 就满足这个要求。在代码中不同的部分使用或者不使用`pub`决定了实现细节的封装。

## 作为类型系统的继承和作为代码共享的继承

**继承**（*Inheritance*）是一个很多编程语言都提供的机制，一个对象可以定义为继承另一个对象的定义，这使其可以获得父对象的数据和行为，而不用重新定义。一些人定义面向对象语言时，认为继承是一个特色。

如果一个语言必须有继承才能被称为面向对象的语言的话，那么 Rust 就不是面向对象的。无法定义一个结构体继承自另外一个结构体，从而获得父结构体的成员和方法。然而，如果你过去常常在你的编程工具箱使用继承，根据你希望使用继承的原因，Rust 提供了其他的解决方案。

使用继承有两个主要的原因。第一个是为了重用代码：一旦为一个类型实现了特定行为，继承可以对一个不同的类型重用这个实现。相反 Rust 代码可以使用默认 trait 方法实现来进行共享，在列表 10-14 中我们见过在`Summarizable` trait 上增加的`summary`方法的默认实现。任何实现了`Summarizable` trait 的类型都可以使用`summary`方法而无须进一步实现。这类似于父类有一个方法的实现，而通过继承子类也拥有这个方法的实现。当实现`Summarizable` trait 时也可以选择覆盖`summary`的默认实现，这类似于子类覆盖从父类继承的方法实现。

第二个使用继承的原因与类型系统有关：用来表现子类型可以在父类型被使用的地方使用。这也被称为**多态**（*polymorphism*），意味着如果多种对象有一个相同的形态大小，它们可以替代使用。

<!-- PROD: START BOX -->

>虽然很多人使用“多态”来描述继承，但是它实际上是一种特殊的多态，称为“子类型多态”。也有很多种其他形式的多态，在 Rust 中带有泛型参数的 trait bound 也是多态，更具体的说是“参数多态”。不同类型多态的确切细节在这里并不关键，所以不要过于担心细节，只需要知道 Rust 有多种多态相关的特色就好，不同于很多其他 OOP 语言。

<!-- PROD: END BOX -->

为了支持这种模式，Rust 有 **trait 对象**（*trait objects*），这样我们也可以指明接受任意类型的值，只要这个值实现了一种特定的 trait。

继承最近在很多编程语言的设计方案中失宠了。使用继承来实现代码重用，会共享比实际需要更多的代码。子类不应该总是共享它们的父类的所有特性，但是继承意味着子类得到了它父类所有的数据和行为。这使得程序的设计更加不灵活，并产生了无意义的方法调用或子类，或者由于方法并不适用于子类，但必需从父类继承而造成错误的可能性。另外，一些语言只允许子类继承一个父类，这进一步限制了程序设计的灵活性。

因为这些原因，Rust 选择了一个另外的途径，使用 trait 对象替代继承。让我们看一下在 Rust 中 trait 对象是如何实现多态的。
