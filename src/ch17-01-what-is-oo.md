## 什么是面向对象？

> [ch17-01-what-is-oo.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-01-what-is-oo.md)
> <br>
> commit 46334522e22d6217b392451cff8b4feca2d69d79

关于一门语言是否需要是面向对象，在编程社区内并达成一致意见。Rust被很多不同的编程模式影响，我们探索了13章提到的函数式编程的特性。面向对象编程语言的一些特性往往是对象、封装和继承。我们看一下每个的含义和Rust是否支持它们。

## 对象包含数据和行为

`Design Patterns: Elements of Reusable Object-Oriented Software`这本书被俗称为`The Gang of Four book`，是面向对象编程模式的目录。它这样定义面向对象编程：

> 面向对象的程序是由对象组成的。一个对象包数据和操作这些数据的程序。程序通常被称为方法或操作。

在这个定一下，Rust是面向对象的：结构体和枚举包含数据和impl块提供了在结构体和枚举上的方法。虽然带有方法的结构体和枚举不称为对象，但是他们提供了和对象相同的功能，使用了` Gang of Four`定义的对象。


## 隐藏了实现细节的封装

通常与面向对象编程相关的另一个方面是封装的思想：对象的实现细节不能被使用对象的代码获取到。唯一与对象交互的方式是通过对象提供的public API，使用对象的代码无法深入到对象内部并直接改变数据或者行为。封装使得改变和重构对象的内部，无需改变使用对象的代码。

就像我们在第7张讨论的那样，我们可以使用pub关键字来决定模块、类型函数和方法是public的（默认情况下一切都是private）。比如，我们可以定义一个结构体`AveragedCollection `包含一个`i32`类型的vector。结构体也可以有一个字段，该字段保存了vector中所有值的平均值。这样，希望知道结构体中的vector的平均值的人可以随着获取到，而无需自己计算。`AveragedCollection` 会为我们缓存平均值结果。 Listing 17-1有`AveragedCollection` 结构体的定义。

Filename: src/lib.rs

```
pub struct AveragedCollection {
    list: Vec<i32>,
    average: f64,
}
```

`AveragedCollection`结构体维护了一个Integer列表和集合中所有元素的平均值。


注意，结构体本身被标记为pub，这样其他代码可以使用这个结构体，但是在结构体内部的字段仍然是private。这是非常重要的，因为我们希望保证变量被增加到列表或者被从列表删除时，也会同时更新平均值。我们通过在结构体上实现add、remove和average方法来做到这一点（ Listing 17-2:）：

Filename: src/lib.rs


```
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

Listing 17-2:在`AveragedCollection`结构体上实现了add、remove和average  public方法

public方法`add`、`remove`和`average`是修改`AveragedCollection`实例的唯一方式。当使用add方法把一个元素加入到`list`或者使用`remove`方法来删除它，这些方法的实现同时会调用私有的`update_average`方法来更新`average`成员变量。因为`list`和`average`是私有的，没有其他方式来使得外部的代码直接向`list`增加或者删除元素，直接操作`list`可能会引发`average`字段不同步。`average`方法返回`average`字段的值，这指的外部的代码只能读取`average`而不能修改它。

因为我们已经封装好了`AveragedCollection`的实现细节，所以我们也可以像使用`list`一样使用的一个不同的数据结构，比如用`HashSet`代替`Vec`。只要签名`add`、`remove`和`average`公有函数保持相同，使用`AveragedCollection`的代码无需改变。如果我们暴露`List`给外部代码时，未必都是这样，因为`HashSet`和`Vec`使用不同的函数增加元素，所以如果要想直接修改`list`的话，外部的代码可能还得修改。

如果封装是一个语言被认为是面向对象语言必要的方面的话，那么Rust满足要求。在代码中不同的部分使用或者不使用`pub`决定了实现细节的封装。

## 作为类型系统的继承和作为代码共享的继承

继承是一个很多编程语言都提供的机制，一个对象可以从另外一个对象的定义继承，这使得可以获得父对象的数据和行为，而不用重新定义。很多人定义面向对象语言时，认为继承是一个特色。

如果一个语言必须有继承才能被称为面向对象的语言，那么Rust就不是面向对象的。没有办法定义一个结构体继承自另外一个结构体，从而获得父结构体的成员和方法。然而，如果你过去常常在你的编程工具箱使用继承，依赖于你要使用继承的原因，在Rust中有其他的方式。

使用继承有两个主要的原因。第一个是为了重用代码：一旦一个特殊的行为从一个类型继承，继承可以在另外一个类型实现代码重用。Rust代码可以被共享通过使用默认的trait方法实现，可以在Listing 10-14看到，我们增加一个`summary`方法到`Summarizable`trait。任何继承了`Summarizable`trait的类型上会有`summary`方法，而无需任何的父代码。这类似于父类有一个继承的方法，一个从父类继承的子类也因为继承有了继承的方法。当实现`Summarizable`trait时，我们也可以选择覆写默认的`summary`方法，这类似于子类覆写了从父类继承的实现方法。

第二个使用继承的原因是，使用类型系统：子类型可以在父类型被使用的地方使用。这也称为多态，意味着如果多种对象有一个相同的shape，它们可以被其他替代。

>虽然很多人使用多态来描述继承，但是它实际上是一种特殊的多态，称为子类型多态。也有很多种其他形式，在Rust中带有通用的ttait绑定的一个参数
>也是多态——更特殊的类型多态。在多种类型的多态间的细节不是关键的，所以不要过于担心细节，只需要知道Rust有多种多态相关的特色就好，不像很多其他OOP语言。

为了支持这种样式，Rust有trait对象，这样我们可以指定给任何类型的值，只要值实现了一种特定的trait。

继承最近在很多编程语言的设计方案中失宠了。使用继承类实现代码重用需要共享比你需要共享的代码。子类不应该经常共享它们的父类的所有特色，但是继承意味着子类得到了它的父类的数据和行为。这使得一个程序的设计不灵活，创建了无意义的子类的方法被调用的可能性或者由于方法不适用于子类但是必须从父类继承，从而触发错误。另外，很多语言只允许从一个类继承，更加限制了程序设计的灵活性。

因为这些原因，Rust选择了一个另外的途径，使用trait替代继承。让我们看一下在Rust中trait对象是如何实现多态的。
