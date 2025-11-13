import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-pos-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  newProduct: any = { name: '', price: 0, stock_quantity: 0 };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (response) => this.products = response.products || [],
      (error) => console.error('Error loading products:', error)
    );
  }

  addProduct(): void {
    this.productService.createProduct(this.newProduct).subscribe(
      () => {
        this.newProduct = { name: '', price: 0, stock_quantity: 0 };
        this.loadProducts();
      },
      (error) => console.error('Error adding product:', error)
    );
  }
}


