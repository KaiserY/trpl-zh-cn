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


